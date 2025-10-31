// Hämtar och visar produkter för vald kategori i en Bootstrap-baserad kortlayout.

class ShopProducts extends HTMLElement {
  constructor() {
    super();
    // Aktiverar Shadow DOM för att kapsla in komponenten visuellt
    this.attachShadow({ mode: "open" });

    // API-url och interna variabler
    this.api = "https://dummyjson.com/products/category/";
    this.currentType = null;
    this.allProducts = [];
    this.viewProducts = [];
    this.currentSub = "alla";
  }

  connectedCallback() {
    // Visar tom sektion tills användaren valt kategori
    this.renderEmpty();

    // Lyssnar på eventet "category:selected" och laddar vald kategori
    document.addEventListener("category:selected", (e) => {
      const { product_type } = e.detail;
      this.loadByCategory(product_type);
    });
  }

  // Hämtar produkter från API baserat på vald kategori
  async loadByCategory(type) {
    this.currentType = type;
    this.currentSub = "alla";
    this.renderLoading();

    try {
      const res = await fetch(this.api + encodeURIComponent(type));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      const raw = payload.products || [];

      // Mappning till enklare objekt med tydliga fält
      this.allProducts = raw.map((p) => ({
        id: p.id,
        name: p.title,
        brand: p.brand || "",
        price: String(p.price),
        currency: "SEK",
        image: p.thumbnail,
        description: p.description || "",
        rating: p.rating ?? null,
        product_type: p.category,
      }));

      // Visar alla produkter initialt
      this.viewProducts = [...this.allProducts];
      this.renderList();
    } catch (err) {
      // Visar felmeddelande vid problem med hämtningen
      this.renderError(err);
    }
  }

  // Visar tom sektion innan någon kategori är vald
  renderEmpty() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
      <section></section>
    `;
  }

  // Visar laddningsstatus medan produkter hämtas
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

  // Visar felmeddelande om något går fel vid API-anrop
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

  // Renderar produktlistan utifrån aktuell kategori och filter
  renderList() {
    const context = {
      prettyCategory: this.pretty(this.currentType),
      productCount: this.viewProducts.length,
      showSub: this.currentType === "beauty",
      products: this.viewProducts,
      subButtons: [
        { key: 'alla', label: 'Alla', active: this.currentSub === 'alla' },
        { key: 'bas', label: 'Bas', active: this.currentSub === 'bas' },
        { key: 'ogon', label: 'Ögon', active: this.currentSub === 'ogon' },
        { key: 'lappar', label: 'Läppar', active: this.currentSub === 'lappar' }
      ]
    };

    // Handlebars-mall för att bygga HTML dynamiskt
    const html = `
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
      <style>
        h2 { font-size: 1.5rem; font-weight: 600; }
        .card { border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.08); transition: 0.15s; }
        .card img { height: 180px; object-fit: cover; }
        .btn { border-radius: 10px; }

        /* Svart knappstil som ersätter Bootstraps blå */
        .btn-outline-primary,
        .btn-outline-secondary {
          color:#111827 !important;
          border-color:#111827 !important;
          background: transparent !important;
        }
        .btn-outline-primary:hover,
        .btn-outline-secondary:hover {
          color:#fff !important;
          background:#111827 !important;
          border-color:#111827 !important;
        }

        .badge {
          background:#111827;
          color:#fff;
          border:none;
        }
        .badge:hover { background:#000; }
      </style>
      <section>
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h2 class="mb-0">Produkter – {{prettyCategory}}</h2>
          <span class="text-muted small">{{productCount}} st</span>
        </div>

        {{#if showSub}}
        <div class="mb-3">
          <div class="btn-group" role="group" aria-label="Underkategorier">
            {{#each subButtons}}
            <button type="button" class="btn btn-outline-secondary {{#if active}}active{{/if}}" data-sub="{{key}}">{{label}}</button>
            {{/each}}
          </div>
        </div>
        {{/if}}

        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
          {{#each products}}
            ${this.card()}
          {{/each}}
        </div>
      </section>
    `;
    const template = Handlebars.compile(html);
    this.shadowRoot.innerHTML = template(context);

    // Hanterar felaktiga bilder genom fallback
    this.shadowRoot.querySelectorAll(".card-img-top").forEach((img) => {
      img.addEventListener("error", () => {
        img.src = "https://via.placeholder.com/400x300?text=No+image";
      }, { once: true });
    });

    // Hanterar "Visa mer info"-knappar och skickar valt produktobjekt
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

    // Aktiverar underfilterknappar (endast för makeup)
    if (context.showSub) {
      this.shadowRoot.querySelectorAll("[data-sub]").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.applySub(btn.getAttribute("data-sub"));
        });
      });
    }
  }

  // Returnerar HTML-strukturen för varje produktkort
  card() {
    return `
      <div class="col">
        <div class="card h-100">
          <img class="card-img-top" src="{{image}}" alt="{{name}}">
          <div class="card-body d-flex flex-column">
            <h3 class="h6 card-title mb-1">{{name}}</h3>
            {{#if brand}}<p class="text-muted small mb-2">{{brand}}</p>{{/if}}
            <p class="fw-semibold mb-3">{{price}} {{currency}}</p>
            <button class="btn btn-outline-primary mt-auto" data-id="{{id}}">
              Visa mer info
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Översätter API-kategorier till svenska namn
  pretty(type) {
    switch (type) {
      case "beauty": return "Makeup";
      case "skin-care": return "Hudvård";
      case "fragrances": return "Parfym";
      default: return type ?? "";
    }
  }

  // Filtrerar makeup-produkter efter underkategori
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

    // Renderar om listan efter filtrering
    this.renderList();
  }
}

// Registrerar komponenten som <shop-products>
customElements.define("shop-products", ShopProducts);

