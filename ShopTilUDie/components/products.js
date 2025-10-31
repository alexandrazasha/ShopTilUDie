// components/products.js
// Uppdaterad version med svart knapp-styling

class ShopProducts extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.api = "https://dummyjson.com/products/category/";
    this.currentType = null;
    this.allProducts = [];
    this.viewProducts = [];
    this.currentSub = "alla";
  }

  connectedCallback() {
    // Visa tom vy tills användaren valt kategori
    this.renderEmpty();

    // Lyssna på kategori-val
    document.addEventListener("category:selected", (e) => {
      const { product_type } = e.detail;
      this.loadByCategory(product_type);
    });
  }

  // =======================
  // API-HÄMTNING
  // =======================
  async loadByCategory(type) {
    this.currentType = type;
    this.currentSub = "alla";
    this.renderLoading();

    try {
      const res = await fetch(this.api + encodeURIComponent(type));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      const raw = payload.products || [];

      this.allProducts = raw.map((p) => ({
        id: p.id,
        name: p.title,
        brand: p.brand || "",
        price: String(p.price),
        currency: "USD",
        image: p.thumbnail,
        description: p.description || "",
        rating: p.rating ?? null,
        product_type: p.category,
      }));

      this.viewProducts = [...this.allProducts];
      this.renderList();
    } catch (err) {
      this.renderError(err);
    }
  }

  // =======================
  // RENDER-METODER
  // =======================
  renderEmpty() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
      <section>
        <!-- Tom vy tills kategori valts -->
      </section>
    `;
  }

  renderLoading() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
      <section>
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h2 class="h4 mb-0">Produkter</h2>
          <span class="text-muted small">Laddar...</span>
        </div>
        <div class="alert alert-info">Hämtar produkter…</div>
      </section>
    `;
  }

  renderError(err) {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
      <section>
        <div class="alert alert-danger">
          Kunde inte hämta produkter (${err.message})
        </div>
      </section>
    `;
  }

  renderList() {
    const showSub = this.currentType === "beauty";
    const html = `
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
      <style>
        h2 { font-size: 1.5rem; font-weight: 600; }
        .card { border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.08); transition: 0.15s; }
        .card img { height: 180px; object-fit: cover; }
        .btn { border-radius: 10px; }

        /* Svarta knappar (överskugga bootstrap) */
        .btn-outline-primary,
        .btn-outline-secondary{
          color:#111827 !important;
          border-color:#111827 !important;
          background: transparent !important;
        }
        .btn-outline-primary:hover,
        .btn-outline-secondary:hover{
          color:#fff !important;
          background:#111827 !important;
          border-color:#111827 !important;
        }

        /* (om någon badge dyker upp här i framtiden – håll dem svarta) */
        .badge{
          background:#111827;
          color:#fff;
          border:none;
        }
        .badge:hover{ background:#000; }
      </style>
      <section>
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h2 class="mb-0">Produkter – ${this.pretty(this.currentType)}</h2>
          <span class="text-muted small">${this.viewProducts.length} st</span>
        </div>

        ${
          showSub
            ? `
          <div class="mb-3">
            <div class="btn-group" role="group" aria-label="Underkategorier">
              ${this.subBtn("alla", "Alla")}
              ${this.subBtn("bas", "Bas")}
              ${this.subBtn("ogon", "Ögon")}
              ${this.subBtn("lappar", "Läppar")}
            </div>
          </div>
        `
            : ""
        }

        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
          ${this.viewProducts.map((p) => this.card(p)).join("")}
        </div>
      </section>
    `;
    this.shadowRoot.innerHTML = html;

    // Bild-fallback
    this.shadowRoot.querySelectorAll(".card-img-top").forEach((img) => {
      img.addEventListener(
        "error",
        () => {
          img.src = "https://via.placeholder.com/400x300?text=No+image";
        },
        { once: true }
      );
    });

    // Visa mer info-knapp
    this.shadowRoot.querySelectorAll("button[data-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.getAttribute("data-id"));
        const product =
          this.viewProducts.find((p) => p.id === id) ||
          this.allProducts.find((p) => p.id === id);
        if (product) {
          this.dispatchEvent(
            new CustomEvent("product:selected", {
              bubbles: true,
              composed: true,
              detail: { product },
            })
          );
        }
      });
    });

    // Underfilter
    if (showSub) {
      this.shadowRoot.querySelectorAll("[data-sub]").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.applySub(btn.getAttribute("data-sub"));
        });
      });
    }
  }

  // =======================
  // HJÄLPMETODER
  // =======================
  card(p) {
    const brand = p.brand ? `<p class="text-muted small mb-2">${p.brand}</p>` : "";
    const img = p.image || "https://via.placeholder.com/400x300?text=No+image";
    return `
      <div class="col">
        <div class="card h-100">
          <img class="card-img-top" src="${img}" alt="${p.name}">
          <div class="card-body d-flex flex-column">
            <h3 class="h6 card-title mb-1">${p.name}</h3>
            ${brand}
            <p class="fw-semibold mb-3">${p.price} ${p.currency}</p>
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
      case "skin-care": return "Hudvård";
      case "fragrances": return "Parfym";
      default: return type ?? "";
    }
  }

  applySub(key) {
    this.currentSub = key;
    const t = (s) => (s || "").toLowerCase();

    if (key === "alla") {
      this.viewProducts = [...this.allProducts];
    } else if (key === "bas") {
      this.viewProducts = this.allProducts.filter((p) =>
        /foundation|primer|powder|conceal/i.test(p.name)
      );
    } else if (key === "ogon") {
      this.viewProducts = this.allProducts.filter((p) =>
        /mascara|eyeshadow|liner|brow/i.test(p.name)
      );
    } else if (key === "lappar") {
      this.viewProducts = this.allProducts.filter((p) =>
        /lip|gloss|stick/i.test(t(p.name))
      );
    }

    this.renderList();
  }
}

customElements.define("shop-products", ShopProducts);
