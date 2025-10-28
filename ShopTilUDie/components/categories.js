// Enkel kategori-komponent: Makeup (beauty), Hudvård (skincare), Parfym (fragrances)

class ShopCategories extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.categories = [
      { label: "Makeup",     type: "beauty",      emoji: "💄" },
      { label: "Hudvård",    type: "skin-care",    emoji: "🧴" },
      { label: "Parfym",     type: "fragrances",  emoji: "🌸" },
    ];
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const html = `
      <link rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
      <section class="mb-3">
        <h2 class="h4 mb-3">Kategorier</h2>
        <div class="d-flex flex-wrap gap-2">
          ${this.categories.map(c => `
            <button class="btn btn-outline-primary" data-type="${c.type}">
              ${c.emoji} ${c.label}
            </button>
          `).join("")}
        </div>
      </section>
    `;
    this.shadowRoot.innerHTML = html;

    this.shadowRoot.querySelectorAll("button[data-type]").forEach(btn => {
      btn.addEventListener("click", () => {
        const product_type = btn.getAttribute("data-type");
        // Skicka händelse som produkterna lyssnar på
        this.dispatchEvent(new CustomEvent("category:selected", {
          bubbles: true,
          composed: true,
          detail: { product_type }
        }));
      });
    });
  }
}

customElements.define("shop-categories", ShopCategories);
