class ShopShoppingCart extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.items = []; // Lagrar { product, quantity }

    // Bind event handlers
    this.boundHandleAddItem = this.handleAddItem.bind(this);
  }

  connectedCallback() {
    document.addEventListener("cart:add-item", this.boundHandleAddItem);
    this.render();
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

    this.render();
  }

  updateQuantity(productId, change) {
    const item = this.items.find(item => item.product.id === productId);
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
      // Remove the item if quantity is zero or less
      this.items = this.items.filter(item => item.product.id !== productId);
    }

    this.render();
  }

  // --- RENDER LOGIC ---

  render() {
    const hasItems = this.items.length > 0;
    const total = this.items.reduce((sum, item) => {
      return sum + parseFloat(item.product.price) * item.quantity;
    }, 0);

    const html = `
      <link rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
      <style>
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
      </style>
      
      <section class="card shadow">
        <div class="card-header">
          <h2 class="h4 mb-0">🛒 Kundvagn</h2>
        </div>
        <div class="card-body">
          ${hasItems ? this.renderItems() : '<p class="text-muted">Din kundvagn är tom.</p>'}
        </div>
        ${hasItems ? `
          <div class="card-footer">
            <div class="d-flex justify-content-between align-items-center">
              <span class="fw-bold fs-5">Totalt:</span>
              <span class="fw-bold fs-5">${total.toFixed(2)} SEK</span>
            </div>
            <button class="btn btn-success w-100 mt-3">Gå till kassan</button>
          </div>
        ` : ''}
      </section>
    `;

    this.shadowRoot.innerHTML = html;
    this.bindEvents();
  }

  renderItems() {
    return `
      <ul class="list-group list-group-flush">
        ${this.items.map(item => this.renderItem(item)).join("")}
      </ul>
    `;
  }

  renderItem(item) {
    const { product, quantity } = item;
    const lineTotal = (parseFloat(product.price) * quantity).toFixed(2);

    return `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <img src="${product.image}" alt="${product.name}" class="cart-item-img rounded me-3">
          <div>
            <div class="fw-bold">${product.name}</div>
            <small class="text-muted">${parseFloat(product.price).toFixed(2)} SEK / st</small>
          </div>
        </div>
        
        <div class="d-flex align-items-center">
          <div class="d-flex align-items-center quantity-controls me-3">
            <button class="btn btn-sm btn-outline-secondary" data-action="decrease" data-id="${product.id}">-</button>
            <span class="mx-2" style="min-width: 20px; text-align: center;">${quantity}</span>
            <button class="btn btn-sm btn-outline-secondary" data-action="increase" data-id="${product.id}">+</button>
          </div>
          <div class="fw-bold me-3" style="min-width: 70px; text-align: right;">${lineTotal} SEK</div>
          <button class="btn-close" aria-label="Remove item" data-action="remove" data-id="${product.id}"></button>
        </div>
      </li>
    `;
  }

  bindEvents() {
    this.shadowRoot.querySelectorAll("button[data-id]").forEach(btn => {
      const productId = parseInt(btn.dataset.id, 10);
      const action = btn.dataset.action;

      btn.addEventListener("click", () => {
        switch (action) {
          case "increase":
            this.updateQuantity(productId, 1);
            break;
          case "decrease":
            this.updateQuantity(productId, -1);
            break;
          case "remove":
            // Set quantity to 0 to trigger removal
            this.updateQuantity(productId, -Infinity);
            break;
        }
      });
    });
  }
}

customElements.define("shop-shopping-cart", ShopShoppingCart);
