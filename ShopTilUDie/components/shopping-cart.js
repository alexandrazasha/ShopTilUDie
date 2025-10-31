// Hanterar skapande/visning av panel, läs/skriv av varor, badge-uppdatering och knapphändelser.

(() => {
  // Konstanter för localStorage-nyckel, länk/id till ikon och panel, samt badge-selektor
  const KEY = 'shopping-cart';
  const LINK_ID = 'mini-cart-link';
  const PANEL_ID = 'mini-cart-panel';
  const BADGE_SEL = '.cart-counter';

  // Lagring och formatering:
  // read() hämtar varor från localStorage (tom array vid fel)
  // write() sparar varor och uppdaterar UI (badge + lista)
  // fmt() formaterar belopp till SEK
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const write = (items) => { localStorage.setItem(KEY, JSON.stringify(items)); updateBadge(); renderList(); };
  const fmt = n => new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(n);

  // Skapar panelen för mini-kundvagnen vid behov (endast en gång)
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

    // Grundlayout för panelen: header, varulista, total och "kassa"-knapp
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

    // Klick inuti panelen ska inte bubbla upp och stänga panelen
    panel.addEventListener('click', e => e.stopPropagation());

    // Tömmer kundvagnen
    panel.querySelector('#mini-cart-clear').addEventListener('click', () => write([]));

    // "Gå till kassan" visar en info-ruta (ingen faktisk navigering)
    panel.querySelector('#mini-cart-checkout').addEventListener('click', (e) => {
      e.preventDefault();
      alert('Kassan ingår inte i denna inlämning');
    });
  };

  // Uppdaterar badge med totalt antal artiklar (summerar qty)
  const updateBadge = () => {
    const badge = document.querySelector(BADGE_SEL);
    if (!badge) return;
    const count = read().reduce((sum, it) => sum + (it.qty || 1), 0);
    badge.textContent = String(count);
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  };

  // Renderar varulistan i panelen samt totalbelopp
  const renderList = () => {
    const box = document.getElementById('mini-cart-items');
    const totalEl = document.getElementById('mini-cart-total');
    if (!box || !totalEl) return;

    const items = read();

    // Tomt läge när inga varor finns
    if (!items.length) {
      box.innerHTML = `<div class="text-muted">Inget i kundvagnen ännu.</div>`;
      totalEl.textContent = fmt(0);
      return;
    }

    // Bygger varje rad: bild, titel, pris, qty-knappar och ta bort-knapp
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

    // Beräknar totalbeloppet
    const total = items.reduce((sum, it) => sum + (it.price || 0) * (it.qty || 1), 0);
    totalEl.textContent = fmt(total);

    // Knappar för att öka/minska/ta bort utan att stänga panelen
    box.querySelectorAll('button[data-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = +btn.dataset.i;
        const act = btn.dataset.act;
        const arr = read();
        if (!arr[i]) return;

        if (act === 'inc') arr[i].qty = (arr[i].qty || 1) + 1;
        if (act === 'dec') arr[i].qty = Math.max(1, (arr[i].qty || 1) - 1);
        if (act === 'del') arr.splice(i, 1);

        write(arr); // sparar och uppdaterar badge + lista
      });
    });
  };

  // Visar/döljer panelen samt toggle-läge
  const showPanel = () => { ensurePanel(); document.getElementById(PANEL_ID).style.display = 'block'; };
  const hidePanel = () => { const p = document.getElementById(PANEL_ID); if (p) p.style.display = 'none'; };
  const togglePanel = () => {
    ensurePanel();
    const p = document.getElementById(PANEL_ID);
    p.style.display = (p.style.display === 'block') ? 'none' : 'block';
  };

  // Init: skapar panelen, synkar badge/lista och kopplar händelser
  document.addEventListener('DOMContentLoaded', () => {
    ensurePanel();
    updateBadge();
    renderList();

    // Klick på kundvagnsikonen i navbaren öppnar/stänger panelen
    // Lyssnar på body eftersom navbaren kan vara ett web component som laddas senare
    document.body.addEventListener('click', (e) => {
      if (e.target.closest(`#${LINK_ID}`)) {
        e.preventDefault();
        e.stopPropagation();
        togglePanel();
      }
    });

    // Stänger panelen när man klickar utanför den (klick inuti stoppas tidigare)
    document.addEventListener('click', (e) => {
      const panel = document.getElementById(PANEL_ID);
      if (!panel || panel.style.display === 'none') return;

      const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
      const insidePanel = path.includes(panel) || panel.contains(e.target);

      if (!insidePanel) hidePanel();
    }, true);

    // Synkronisering mellan flikar/fönster: uppdatera UI när localStorage ändras
    window.addEventListener('storage', (e) => {
      if (e.key === KEY) { updateBadge(); renderList(); }
    });
  });

  // Tar emot produkter från produktdetalj-komponenten och lägger i kundvagnen
  window.addEventListener('AddedToCart', (e) => {
    const { id, title, price, image, quantity = 1 } = e.detail || {};
    const arr = read();
    const i = arr.findIndex(x => x.id === id);
    if (i >= 0) arr[i].qty = (arr[i].qty || 1) + quantity;
    else arr.push({ id, title, price, image, qty: quantity });
    write(arr);
    showPanel(); // öppnar panelen direkt efter tillägg
  });
})();
