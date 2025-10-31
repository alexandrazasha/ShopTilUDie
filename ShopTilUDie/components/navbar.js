// components/navbar.js
// Elegant centrerad navbar med Playfair Display och svart färgtema

class ShopNavbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.itemCount = 0;
    this.handleCartUpdate = this.handleCartUpdate.bind(this);
    this.openCartModal = this.openCartModal.bind(this);
  }

  connectedCallback() {
    document.addEventListener('cart:updated', this.handleCartUpdate);
    this.render();
  }

  disconnectedCallback() {
    document.removeEventListener('cart:updated', this.handleCartUpdate);
  }

  handleCartUpdate(event) {
    this.itemCount = event.detail.itemCount;
    this.render(); // Re-render to update the badge
  }

  openCartModal(event) {
    event.preventDefault();
    const cartComponent = document.querySelector('shop-shopping-cart');
    if (cartComponent) {
      cartComponent.show();
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');

        :host {
          display: block;
          background: #fff;
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        nav {
          padding-block: 1rem;
        }

        .brand {
          font-family: 'Playfair Display', serif;
          font-size: 1.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #111827;
          text-decoration: none;
        }

        .nav {
          justify-content: center;
          gap: 2rem;
        }

        .nav-link {
          color: #111827 !important;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: color 0.2s ease;
        }

        .nav-link:hover {
          color: #000 !important;
          text-decoration: none;
        }

        .cart-link {
          position: relative;
          cursor: pointer;
        }

        .cart-badge {
          position: absolute;
          top: -2px;
          right: -12px;
          font-size: 0.65rem;
          line-height: 1;
          padding: 0.25em 0.4em;
          background-color: #dc3545; /* Bootstrap danger red */
          color: white;
        }

        @media (max-width: 768px) {
          .brand {
            font-size: 1.4rem;
          }
          .nav {
            gap: 1rem;
          }
        }
      </style>

      <nav class="navbar text-center">
        <div class="container d-flex flex-column align-items-center">
          <a href="#" class="brand mb-2">Beauty Store</a>
          <ul class="nav">
            <li class="nav-item"><a class="nav-link" href="#">Hem</a></li>
            <li class="nav-item"><a class="nav-link" href="#">Produkter</a></li>
            <li class="nav-item"><a class="nav-link" href="#">Om oss</a></li>
            <li class="nav-item"><a class="nav-link" href="#">Kontakt</a></li>
            <li class="nav-item">
              <a class="nav-link cart-link" href="#">🛒${this.itemCount > 0 ? `<span class="badge rounded-pill cart-badge">${this.itemCount}</span>` : ''}</a>
            </li>
          </ul>
        </div>
      </nav>
    `;

    // Attach event listener after every render to prevent it from being lost
    const cartLink = this.shadowRoot.querySelector('.cart-link');
    cartLink.addEventListener('click', this.openCartModal);
  }
}

customElements.define("shop-navbar", ShopNavbar);
