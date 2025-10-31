// shopping-cart.js —  mini-kundvagn (localStorage)
// - Öppnas/stängs via kundvagnsikonen (#mini-cart-link)
// - Stängs endast när man klickar utanför panelen
// - + / − / × uppdaterar utan att stänga panelen
// - "Gå till kassan" knappen visar bara men har ingen navigering

(() => {
  const KEY = 'shopping-cart';      // localStorage-nyckel
  const LINK_ID = 'mini-cart-link'; // ikon i navbaren
  const PANEL_ID = 'mini-cart-panel';
  const BADGE_SEL = '.cart-counter';

// Funktioner som sköter lagringen och prisformat
// read() läser kundvagnen från localStorage
// write() sparar och uppdaterar kundvagnen
// fmt() gör om siffror till SEK
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const write = (items) => { localStorage.setItem(KEY, JSON.stringify(items)); updateBadge(); renderList(); };
  const fmt = n => new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(n);

  // --- Skapar panelen för kundvagnen en gång ---
  const ensurePanel = () => {
    if (document.getElementById(PANEL_ID)) return;

    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    Object.assign(panel.style, {
      position: 'fixed',
      top: '76px',
      right: '16px',
      width: '320px',
      maxHeight: '70vh',
      overflow: 'auto',
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 12px 30px rgba(0,0,0,.2)',
      padding: '14px',
      zIndex: '2000',
      display: 'none'
    });

    panel.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="m-0">Kundvagn</h6>
        <button class="btn btn-sm btn-outline-secondary" id="mini-cart-clear">Töm</button>
      </div>

      <div id="mini-cart-items" class="vstack gap-2"></div>

      <div class="d-flex justify-content-between align-items-center mt-3">
        <strong>Totalt</strong>
        <strong id="mini-cart-total">0 kr</strong>
      </div>

      <button class="btn btn-primary w-100 mt-3" id="mini-cart-checkout">Gå till kassan</button>
    `;

    document.body.appendChild(panel);

    // Gör så att klick inuti kundvagnspanelen inte stänger den
   // (annars tror sidan att man klickat utanför)
    panel.addEventListener('click', e => e.stopPropagation());

    // Töm kundvagn
    panel.querySelector('#mini-cart-clear').addEventListener('click', () => write([]));

    // "Gå till kassan" – ingen navigering
    panel.querySelector('#mini-cart-checkout').addEventListener('click', (e) => {
      e.preventDefault();
      alert('Kassan ingår inte i denna inlämning');
    });
  };

  // --- Badge (antal i kundvagn) ---
  const updateBadge = () => {
    const badge = document.querySelector(BADGE_SEL);
    if (!badge) return;
    const count = read().reduce((sum, it) => sum + (it.qty || 1), 0);
    badge.textContent = String(count);
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  };

  // --- Lista varor i panelen ---
  const renderList = () => {
    const box = document.getElementById('mini-cart-items');
    const totalEl = document.getElementById('mini-cart-total');
    if (!box || !totalEl) return;

    const items = read();

    if (!items.length) {
      box.innerHTML = `<div class="text-muted">Inget i kundvagnen ännu.</div>`;
      totalEl.textContent = fmt(0);
      return;
    }

    box.innerHTML = items.map((it, i) => `
      <div class="d-flex align-items-center gap-2 border rounded p-2">
        <img src="${it.image || ''}" alt="" style="width:48px;height:48px;object-fit:contain;background:#fff">
        <div class="flex-fill">
          <div class="fw-semibold small">${it.title || 'Produkt'}</div>
          <div class="text-muted small">${fmt(it.price || 0)}</div>
        </div>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-secondary" data-act="dec" data-i="${i}">−</button>
          <button class="btn btn-outline-secondary disabled">${it.qty || 1}</button>
          <button class="btn btn-outline-secondary" data-act="inc" data-i="${i}">+</button>
        </div>
        <button class="btn btn-sm btn-outline-danger" data-act="del" data-i="${i}">×</button>
      </div>
    `).join('');

    const total = items.reduce((sum, it) => sum + (it.price || 0) * (it.qty || 1), 0);
    totalEl.textContent = fmt(total);

    // Knappar: + / − / ×
    box.querySelectorAll('button[data-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = +btn.dataset.i;
        const act = btn.dataset.act;
        const arr = read();
        if (!arr[i]) return;

        if (act === 'inc') arr[i].qty = (arr[i].qty || 1) + 1;
        if (act === 'dec') arr[i].qty = Math.max(1, (arr[i].qty || 1) - 1);
        if (act === 'del') arr.splice(i, 1);

        write(arr); // uppdatera + rita om + badge
      });
    });
  };

  // --- Visa/dölj panel ---
  const showPanel = () => { ensurePanel(); document.getElementById(PANEL_ID).style.display = 'block'; };
  const hidePanel = () => { const p = document.getElementById(PANEL_ID); if (p) p.style.display = 'none'; };
  const togglePanel = () => {
    ensurePanel();
    const p = document.getElementById(PANEL_ID);
    p.style.display = (p.style.display === 'block') ? 'none' : 'block';
  };

  // --- Init ---
  document.addEventListener('DOMContentLoaded', () => {
    ensurePanel();
    updateBadge();
    renderList();

    // Ikon i navbar → öppna/stäng panelen
    // We need to listen on the body because the navbar is a web component and its content might not be ready immediately.
    document.body.addEventListener('click', (e) => {
      if (e.target.closest(`#${LINK_ID}`)) {
        e.preventDefault();
        e.stopPropagation();
        togglePanel();
      }
    });

    // Stäng bara när man klickar UTANFÖR panelen
    document.addEventListener('click', (e) => {
      const panel = document.getElementById(PANEL_ID);
      if (!panel || panel.style.display === 'none') return;

      const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
      const insidePanel = path.includes(panel) || panel.contains(e.target);

      if (!insidePanel) hidePanel();
    }, true);

    // Synk mellan flikar
    window.addEventListener('storage', (e) => {
      if (e.key === KEY) { updateBadge(); renderList(); }
    });
  });

  // Lägg till produkt från product-details.js
  window.addEventListener('AddedToCart', (e) => {
    const { id, title, price, image, quantity = 1 } = e.detail || {};
    const arr = read();
    const i = arr.findIndex(x => x.id === id);
    if (i >= 0) arr[i].qty = (arr[i].qty || 1) + quantity;
    else arr.push({ id, title, price, image, qty: quantity });
    write(arr);
    showPanel(); // öppna panelen direkt
  });
})();
        