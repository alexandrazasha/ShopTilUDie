// components/navbar.js
// Elegant centrerad navbar med Playfair Display och svart färgtema

class ShopNavbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
  }

  async render() {
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
              <a id="mini-cart-link" class="nav-link" href="#">
                🛒
                <span class="badge rounded-pill cart-counter" style="display: none;">0</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
    `;
  }
}

customElements.define("shop-navbar", ShopNavbar);
