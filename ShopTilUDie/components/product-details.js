// components/product-details.js
// Visar detaljer för den valda produkten och hanterar knapparna "Tillbaka" och "Lägg till i kundvagn".

class ShopProductDetails extends HTMLElement {
  constructor() {
    super();
    // Använder Shadow DOM för att kapsla in komponentens innehåll och stil
    this.attachShadow({ mode: "open" });
    // Håller den aktuellt valda produkten
    this.product = null;
  }

  connectedCallback() {
    // Lyssnar på när en produkt valts i ShopProducts-komponenten
    document.addEventListener("product:selected", this.handleProductSelected.bind(this));
    // Renderar initialt tom vy
    this.render();
  }

  disconnectedCallback() {
    // Tar bort eventlyssnare om komponenten tas bort från DOM
    document.removeEventListener("product:selected", this.handleProductSelected.bind(this));
  }

  // Tar emot vald produkt och uppdaterar vyn
  handleProductSelected(event) {
    this.product = event.detail.product;
    this.render();
  }

  render() {
    // Grundläggande HTML och stil som alltid inkluderas
    const html = `
      <link rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
      <style>
        :host([hidden]) {
          display: none !important;
        }

        .product-image {
          max-width: 100%;
          height: auto;
          object-fit: contain;
        }

        /* Svart knappstil som ersätter Bootstraps standardfärg */
        .btn-primary, .btn-outline-secondary {
          background-color: #111827 !important;
          color: #fff !important;
          border-color: #111827 !important;
        }
        .btn-primary:hover, .btn-outline-secondary:hover {
          background-color: #000 !important;
          border-color: #000 !important;
        }
      </style>
    `;

    // Om ingen produkt är vald – visa tom layout
    if (!this.product) {
      this.shadowRoot.innerHTML = html;
      return;
    }

    // Säker formattering av priset (visas med två decimaler)
    const priceNum = parseFloat(this.product.price);
    const formattedPrice = isNaN(priceNum)
      ? "Pris ej specificerat"
      : `${priceNum.toFixed(2)} ${this.product.currency || "SEK"}`;

    // Bygger HTML för produktens detaljer
    const detailsHtml = `
      <section class="card mb-4 shadow">
        <div class="card-body">
          <button class="btn btn-outline-secondary mb-3" id="back-to-products">
            ← Tillbaka till produkter
          </button>
          
          <div class="row">
            <div class="col-md-5">
              <img src="${this.product.image || 'https://via.placeholder.com/400x300?text=Product+Image'}" 
                   class="img-fluid rounded product-image" alt="${this.product.name}">
            </div>
            <div class="col-md-7">
              <h2 class="card-title h3">${this.product.name}</h2>
              ${this.product.brand ? `<h3 class="h5 text-muted mb-3">${this.product.brand}</h3>` : ''}
              
              <p class="card-text">${this.product.description || 'Ingen beskrivning tillgänglig.'}</p>
              
              <ul class="list-group list-group-flush mb-4">
                <li class="list-group-item">
                  <strong>Pris:</strong>
                  <span class="fw-bold fs-5">${formattedPrice}</span>
                </li>
                <li class="list-group-item">
                  <strong>Kategori:</strong> ${this.product.product_type || 'Ej specificerad'}
                </li>
                ${this.product.rating ? `<li class="list-group-item">
                  <strong>Betyg:</strong> ${this.product.rating.toFixed(1)} / 5.0
                </li>` : ''}
              </ul>

              <button class="btn btn-primary btn-lg w-100" id="add-to-cart">
                🛒 Lägg till i kundvagn
              </button>
            </div>
          </div>
        </div>
      </section>
    `;

    // Renderar hela komponenten
    this.shadowRoot.innerHTML = html + detailsHtml;
    
    // "Tillbaka"-knapp: växlar tillbaka till produktlistan
    this.shadowRoot.getElementById("back-to-products").addEventListener("click", () => {
      this.product = null;
      this.render();

      // Skickar event så att app-initializer växlar vy
      this.dispatchEvent(new CustomEvent("details:closed", {
        bubbles: true,
        composed: true
      }));
    });

    // "Lägg till i kundvagn"-knapp: skickar data till mini-cart (eller motsvarande)
    this.shadowRoot.getElementById("add-to-cart")?.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("AddedToCart", {
        bubbles: true,
        composed: true,
        detail: { 
          id: this.product.id,
          title: this.product.name,
          price: parseFloat(this.product.price),
          image: this.product.image
        }
      }));
    });
  }
}

// Registrerar komponenten som <shop-product-details>
customElements.define("shop-product-details", ShopProductDetails);
