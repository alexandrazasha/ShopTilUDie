class ShopProductDetails extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.product = null; // Lagrar den valda produkten
  }

  connectedCallback() {
    // Lägg till event-lyssnare för att ta emot den valda produkten
    document.addEventListener("product:selected", this.handleProductSelected.bind(this));
    // Återge initialt tomt läge
    this.render();
  }

  disconnectedCallback() {
    // Ta bort event-lyssnare när komponenten tas bort
    document.removeEventListener("product:selected", this.handleProductSelected.bind(this));
  }

  handleProductSelected(event) {
    // Spara produkten från händelsedetaljerna
    this.product = event.detail.product;

    // Rendera detaljerna
    this.render();
  }

  render() {
    const html = `
      <link rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
      <style>
        /* Dölj komponenten helt om ingen produkt är vald, 
           men app-initializer hanterar det också via [hidden] på sektionen. */
        :host([hidden]) {
          display: none !important;
        }
        .product-image {
          max-width: 100%;
          height: auto;
          object-fit: contain;
        }

        /* Button Overrides */
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

    if (!this.product) {
      // Tomt tillstånd (denna komponent är troligen dold av app-initializer)
      this.shadowRoot.innerHTML = html;
      return;
    }

    // Konvertera priset till en snyggare siffra (antar att det är en sträng i din data)
    const priceNum = parseFloat(this.product.price);
    const formattedPrice = isNaN(priceNum) ? 'Pris ej specificerat' : `${priceNum.toFixed(2)} ${this.product.currency || 'SEK'}`;
    
    // Rendera produktdetaljer
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
                  <strong>Pris:</strong> <span class="fw-bold fs-5">${priceNum.toFixed(2)} ${this.product.currency || 'SEK'}</span>
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

    this.shadowRoot.innerHTML = html + detailsHtml;
    
    // Bind "Tillbaka"-knappen
    this.shadowRoot.getElementById("back-to-products").addEventListener("click", () => {
        this.product = null; // Rensa vald produkt
        this.render(); 
        
        // Skicka händelse som app-initializer lyssnar på för att växla vy
        this.dispatchEvent(new CustomEvent("details:closed", {
            bubbles: true,
            composed: true
        }));
    });

    // Bind "Lägg till i kundvagn"-knappen
    this.shadowRoot.getElementById("add-to-cart")?.addEventListener("click", () => {
        // Dispatch the new 'AddedToCart' event that mini-cart.js listens for
        window.dispatchEvent(new CustomEvent("AddedToCart", {
            bubbles: true,
            composed: true,
            detail: { 
              id: this.product.id,
              title: this.product.name, // Map 'name' to 'title'
              price: parseFloat(this.product.price),
              image: this.product.image
            }
        }));
    });
  }
}

customElements.define("shop-product-details", ShopProductDetails);