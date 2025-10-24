// Hämtar produkter från DummyJSON utifrån vald kategori.
// Har ett enkelt under-filter när kategori = "beauty": Bas / Ögon / Läppar.

class ShopProducts extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.api = "https://dummyjson.com/products/category/";
    this.currentType = null;
    this.allProducts = [];   // ofiltrerade från API
    this.viewProducts = [];  // det som visas just nu
    this.currentSub = "alla"; // underfilter för makeup
  }

  connectedCallback() {
    // Grundvy
    this.renderSkeleton();

    // Lyssna på val av kategori från <shop-categories>
    document.addEventListener("category:selected", (e) => {
      const { product_type } = e.detail;
      this.loadByCategory(product_type);
    });
  }

  async loadByCategory(type) {
    this.currentType = type;
    this.currentSub = "alla";
    this.renderLoading();

    try {
      const res = await fetch(this.api + encodeURIComponent(type));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json(); // { products: [...] }
      const raw = payload.products || [];

      // Normalisera till vårt "kontrakt"
      this.allProducts = raw.map(p => ({
        id: p.id,
        name: p.title,
        brand: p.brand || "",
        price: String(p.price),
        currency: "USD",
        image: p.thumbnail,
        description: p.description || "",
        rating: p.rating ?? null,
        product_type: p.category // "beauty", "fragrances", "skincare"
      }));

      // Första vy = alla
      this.viewProducts = [...this.allProducts];
      this.renderList();
    } catch (err) {
      this.renderError(err);
    }
  }

  // --- RENDER HELPERS ---

  renderSkeleton() {
    const html = `
      <link rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
      <section>
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h2 class="h4 mb-0">Produkter</h2>
          <span class="text-muted small">Välj en kategori</span>
        </div>
        <div id="subfilters" class="mb-3"></div>
        <div id="grid" class="row g-3"></div>
      </section>
    `;
    this.shadowRoot.innerHTML = html;
  }

  renderLoading() {
    const html = `
      <link rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
      <section>
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h2 class="h4 mb-0">Produkter</h2>
          <span class="text-muted small">Laddar…</span>
        </div>
        <div class="alert alert-info">Hämtar produkter…</div>
      </section>
    `;
    this.shadowRoot.innerHTML = html;
  }

  renderError(err) {
    const html = `
      <link rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
      <section>
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h2 class="h4 mb-0">Produkter</h2>
        </div>
        <div class="alert alert-danger">Kunde inte hämta produkter (${err.message}).</div>
      </section>
    `;
    this.shadowRoot.innerHTML = html;
  }

  renderList() {
    // Topprad + ev. underfilter (bara när makeup)
    const showSub = this.currentType === "beauty";
    const html = `
      <link rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
      <section>
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h2 class="h4 mb-0">
            Produkter – ${this.pretty(this.currentType)} 
          </h2>
          <span class="text-muted small">${this.viewProducts.length} st</span>
        </div>

        ${showSub ? `
          <div class="mb-3">
            <div class="btn-group" role="group" aria-label="Underkategorier">
              ${this.subBtn("alla","Alla")}
              ${this.subBtn("bas","Bas")}
              ${this.subBtn("ogon","Ögon")}
              ${this.subBtn("lappar","Läppar")}
            </div>
          </div>
        ` : ""}

        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
          ${this.viewProducts.map(p => this.card(p)).join("")}
        </div>
      </section>
    `;
    this.shadowRoot.innerHTML = html;

    // Bind knappar: "Visa mer info"
    this.shadowRoot.querySelectorAll("button[data-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.getAttribute("data-id"));
        const product = this.viewProducts.find(p => p.id === id)
                      || this.allProducts.find(p => p.id === id);
        if (product) {
          this.dispatchEvent(new CustomEvent("product:selected", {
            bubbles: true,
            composed: true,
            detail: { product }
          }));
        }
      });
    });

    // Bind underfilter (om makeup)
    if (showSub) {
      this.shadowRoot.querySelectorAll("[data-sub]").forEach(btn => {
        btn.addEventListener("click", () => {
          this.applySub(btn.getAttribute("data-sub"));
        });
      });
    }
  }

  // --- UI småhjälpare ---

  card(p) {
    const price = p.price;
    const brand = p.brand ? `<p class="text-muted small mb-2">${p.brand}</p>` : "";
    const img = p.image || "https://via.placeholder.com/400x300?text=No+image";
    return `
      <div class="col">
        <div class="card h-100">
          <img class="card-img-top" src="${img}" alt="${p.name}"
               onerror="this.src='https://via.placeholder.com/400x300?text=No+image'">
          <div class="card-body d-flex flex-column">
            <h3 class="h6 card-title mb-1">${p.name}</h3>
            ${brand}
            <p class="fw-semibold mb-3">${price} ${p.currency}</p>
            <button class="btn btn-outline-primary mt-auto" data-id="${p.id}">
              Visa mer info
            </button>
          </div>
        </div>
      </div>
    `;
  }

  subBtn(key, label) {
    const active = this.currentSub === key ? "active" : "";
    return `<button type="button" class="btn btn-outline-secondary ${active}" data-sub="${key}">${label}</button>`;
  }

  pretty(type) {
    switch (type) {
      case "beauty": return "Makeup";
      case "skincare": return "Hudvård";
      case "fragrances": return "Parfym";
      default: return type ?? "";
    }
  }

  // --- Underfilterlogik för makeup ---

  applySub(key) {
    this.currentSub = key;
    const t = (s) => (s || "").toLowerCase();

    if (key === "alla") {
      this.viewProducts = [...this.allProducts];
    } else if (key === "bas") {
      this.viewProducts = this.allProducts.filter(p =>
        /foundation|primer|powder|conceal/i.test(p.name)
      );
    } else if (key === "ogon") {
      this.viewProducts = this.allProducts.filter(p =>
        /mascara|eyeshadow|liner|brow/i.test(p.name)
      );
    } else if (key === "lappar") {
      this.viewProducts = this.allProducts.filter(p =>
        /lip|gloss|stick/i.test(t(p.name))
      );
    }

    // Rendera om listan med uppdaterad knapp-status
    this.renderList();
  }
}

customElements.define("shop-products", ShopProducts);
