class ShopShoppingCart extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.items = []; // Lagrar { product, quantity }
    this.modalInstance = null;
    this.itemsTemplate = null; // To store the compiled template

    // Bind event handlers
    this.boundHandleAddItem = this.handleAddItem.bind(this);
    this.handleCartClick = this.handleCartClick.bind(this);

    // Register a Handlebars helper for formatting currency
    Handlebars.registerHelper('formatPrice', function(price) {
      const priceNum = parseFloat(price);
      return isNaN(priceNum) ? '0.00' : priceNum.toFixed(2);
    });

    Handlebars.registerHelper('multiply', function(a, b) {
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      return (isNaN(numA) || isNaN(numB)) ? 0 : numA * numB;
    });
  }

  connectedCallback() {
    document.addEventListener("cart:add-item", this.boundHandleAddItem);

    // A more robust and synchronous initialization flow
    this.renderStructure();
    const modalEl = this.shadowRoot.querySelector('.modal');
    this.modalInstance = new bootstrap.Modal(modalEl);
    modalEl.addEventListener('click', this.handleCartClick);
    this.itemsTemplate = this.compileItemsTemplate();

    this.updateView(); // Render the initial empty state
  }

  disconnectedCallback() {
    document.removeEventListener("cart:add-item", this.boundHandleAddItem);
  }

  // --- CART LOGIC ---

  handleAddItem(event) {
    const { product, quantity } = event.detail;
    if (!product || !quantity) return;

    const existingItem = this.items.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ product, quantity });
    }

    this.updateView();
    this.dispatchCartUpdate();
  }

  updateQuantity(productId, change) {
    const item = this.items.find(item => item.product.id === productId);
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
      // Remove the item if quantity is zero or less
      this.items = this.items.filter(item => item.product.id !== productId);
    }

    this.updateView(); // Ensure the view is always updated
    this.dispatchCartUpdate();
  }

  dispatchCartUpdate() {
    const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    document.dispatchEvent(new CustomEvent('cart:updated', {
      bubbles: true,
      composed: true,
      detail: {
        itemCount: totalItems
      }
    }));
  }

  show() {
    this.modalInstance?.show();
  }

  hide() {
    this.modalInstance?.hide();
  }

  // --- RENDER LOGIC ---

  renderStructure() {
    const html = `
      <link rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
      <style>
        /* Make each cart item row responsive */
        .list-group-item {
          flex-wrap: wrap;
          gap: 1rem;
        }
        .cart-item-img {
          width: 50px;
          height: 50px;
          object-fit: cover;
        }
        .quantity-controls button {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }
        .cart-item-details {
          /* Allow product name to wrap if it's too long */
          flex-grow: 1;
          flex-shrink: 1;
        }

        /* Button Overrides */
        .btn-success, .btn-outline-secondary {
          background-color: #111827 !important;
          color: #fff !important;
          border-color: #111827 !important;
        }
        .btn-success:hover, .btn-outline-secondary:hover {
          background-color: #000 !important;
          border-color: #000 !important;
        }
        .btn-close {
          background: transparent url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23111827'%3e%3cpath d='M.293.293a1 1 0 0 1 1.414 0L8 6.586 14.293.293a1 1 0 1 1 1.414 1.414L9.414 8l6.293 6.293a1 1 0 0 1-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L6.586 8 .293 1.707a1 1 0 0 1 0-1.414z'/%3e%3c/svg%3e") center/1em auto no-repeat !important;
          opacity: 0.75;
        }
        .btn-close:hover {
          opacity: 1;
        }
        .btn-close:focus {
          box-shadow: 0 0 0 0.25rem rgba(17, 24, 39, 0.25);
        }

        /* Slide-in from right animation */
        .modal.fade .modal-dialog.modal-dialog-slideout {
          transform: translate(100%, 0);
        }
        .modal.show .modal-dialog.modal-dialog-slideout {
          transform: translate(0, 0);
        }
        .modal-dialog-slideout {
          min-height: 100%;
          margin: 0 0 0 auto;
          background: #fff;
          transition: transform 0.3s ease-out;
          max-width: 800px; /* Make the modal wider */
          width: 100%;
        }
        .modal-content {
          border: none;
          border-radius: 0;
        }
        .modal.fade {
          transition: opacity 0.3s linear;
        }

      </style>
      
      <div class="modal fade" id="shoppingCartModal" tabindex="-1" aria-labelledby="shoppingCartModalLabel" aria-hidden="true" data-bs-backdrop="true">
        <div class="modal-dialog modal-lg modal-dialog-slideout">
          <div class="modal-content h-100">
            <div class="modal-header">
              <h2 class="modal-title h4" id="shoppingCartModalLabel">🛒 Kundvagn</h2>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body"></div>
            <div class="modal-footer"></div>
          </div>
        </div>
      </div>
    `;
    this.shadowRoot.innerHTML = html;
  }

  updateView() {
    const hasItems = this.items.length > 0;
    const total = this.items.reduce((sum, item) => {
      return sum + parseFloat(item.product.price) * item.quantity;
    }, 0);

    const modalBody = this.shadowRoot.querySelector('.modal-body');
    const modalFooter = this.shadowRoot.querySelector('.modal-footer');

    if (!modalBody || !modalFooter) return;
    
    if (hasItems) {
      // By creating a deep copy of the items, we ensure Handlebars
      // treats it as new data and re-renders everything correctly.
      const itemsCopy = JSON.parse(JSON.stringify(this.items));
      modalBody.innerHTML = this.itemsTemplate({ items: itemsCopy });
      
      // Recalculate total right before rendering the footer to ensure it's always up-to-date.
      const currentTotal = this.items.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0);
      modalFooter.innerHTML = `<div class="w-100">
          <div class="d-flex justify-content-between align-items-center">
            <span class="fw-bold fs-5">Totalt:</span>
            <span class="fw-bold fs-5">${currentTotal.toFixed(2)} SEK</span>
          </div>
          <button class="btn btn-success w-100 mt-3">Gå till kassan</button>
        </div>
      `;
      modalFooter.style.display = 'block';
    } else {
      modalBody.innerHTML = '<p class="text-muted">Din kundvagn är tom.</p>';
      modalFooter.innerHTML = '';
      modalFooter.style.display = 'none';
    }
  }

  compileItemsTemplate() {
    const templateString = `
      <ul class="list-group list-group-flush">
        {{#each items}}
          <li class="list-group-item d-flex justify-content-between align-items-center" data-product-id="{{this.product.id}}">
            <div class="d-flex align-items-center flex-grow-1">
              <img src="{{this.product.image}}" alt="{{this.product.name}}" class="cart-item-img rounded me-3">
              <div class="cart-item-details">
                <div class="fw-bold text-break">{{this.product.name}}</div>
                <small class="text-muted">{{formatPrice this.product.price}} SEK / st</small>
              </div>
            </div>
            
            <div class="d-flex align-items-center flex-shrink-0">
              <div class="d-flex align-items-center quantity-controls me-3">
                <button class="btn btn-sm btn-outline-secondary" data-action="decrease" data-id="{{this.product.id}}">-</button>
                <span class="mx-2" style="min-width: 20px; text-align: center;">{{this.quantity}}</span>
                <button class="btn btn-sm btn-outline-secondary" data-action="increase" data-id="{{this.product.id}}">+</button>
              </div>
              <div class="fw-bold me-3" style="min-width: 70px; text-align: right;">{{formatPrice (multiply this.product.price this.quantity)}} SEK</div>
              <button class="btn-close" aria-label="Remove item" data-action="remove" data-id="{{this.product.id}}"></button>
            </div>
          </li>
        {{/each}}
      </ul>
    `;
    return Handlebars.compile(templateString);
  }

  handleCartClick(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
  
    const productId = parseInt(button.dataset.id, 10);
    const action = button.dataset.action;
  
    switch (action) {
      case "increase":
        this.updateQuantity(productId, 1);
        break;
      case "decrease":
        this.updateQuantity(productId, -1);
        break;
      case "remove":
        this.updateQuantity(productId, -Infinity); // Triggers removal
        break;
    }
  }
}

customElements.define("shop-shopping-cart", ShopShoppingCart);
