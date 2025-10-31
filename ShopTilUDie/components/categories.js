// components/categories.js
// Uppdaterad version med Pexels-bilder i card-layout

class ShopCategories extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.categories = [
      {
        label: "Makeup",
        type: "beauty",
        img: "https://images.pexels.com/photos/4938502/pexels-photo-4938502.jpeg",
      },
      {
        label: "Hudvård",
        type: "skin-care",
        img: "https://images.pexels.com/photos/6724353/pexels-photo-6724353.jpeg",
      },
      {
        label: "Parfym",
        type: "fragrances",
        img: "https://images.pexels.com/photos/4735906/pexels-photo-4735906.jpeg",
      },
    ];

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
      <style>
        h2 {
          font-size: 1.5rem;
          margin-bottom: .25rem;
        }

        .hint {
          color: #6b7280;
          margin-bottom: 1rem;
        }

        .grid {
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        }

        .card {
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 2px rgba(0,0,0,.04);
          transition: .12s;
          cursor: pointer;
          background: #fff;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,.1);
          border-color: #d1d5db;
        }

        .imgwrap {
          height: 140px;
          background: #f3f4f6;
        }

        .imgwrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .label {
          padding: 14px;
          font-weight: 600;
          color: #111827;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Svart badge (ersätter Bootstrap-blå) */
        .badge {
          background: #111827;
          color: #fff;
          border: none;
        }
        .badge:hover {
          background: #000;
        }

        button.cat {
          all: unset;
          display: block;
        }
      </style>

      <section>
        <h2>Kategorier</h2>
        <div class="hint">Välj en kategori</div>
        <div class="grid">
          ${this.categories.map(c => `
            <button class="cat" data-type="${c.type}">
              <div class="card">
                <div class="imgwrap">
                  <img src="${c.img}" alt="${c.label}"
                       onerror="this.src='https://placehold.co/600x400?text=${encodeURIComponent(c.label)}'">
                </div>
                <div class="label">
                  ${c.label}
                  <!-- Ta bort text-bg-primary så vår svarta badge gäller -->
                  <span class="badge">Välj</span>
                </div>
              </div>
            </button>
          `).join("")}
        </div>
      </section>
    `;

    // Event: skicka valt kategori-typ till produkter
    this.shadowRoot.querySelectorAll(".cat").forEach(btn => {
      btn.addEventListener("click", () => {
        const product_type = btn.getAttribute("data-type");
        this.dispatchEvent(
          new CustomEvent("category:selected", {
            bubbles: true,
            composed: true,
            detail: { product_type },
          })
        );
      });
    });
  }
}

customElements.define("shop-categories", ShopCategories);
