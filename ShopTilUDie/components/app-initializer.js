// components/app-initializer.js
document.addEventListener("DOMContentLoaded", () => {
  const main = document.querySelector("main");

  // --- Layout (bootstrap-grid, centrerad) ---
  if (!main.querySelector("shop-categories")) {
    main.innerHTML = `
      <div class="container">
        <div class="row justify-content-center g-4">
          <div class="col-12 col-lg-10">
            <!-- Sektion för produkter och kategorier -->
            <section id="products-view" class="mb-4">
              <shop-categories></shop-categories>
              <shop-products></shop-products>
            </section>

            <!-- Sektion för produktdetaljer (visas när man klickar på produkt) -->
            <section id="product-details-view" class="mb-4" hidden>
              <shop-product-details></shop-product-details>
            </section>

            <!-- Kundvagn -->
            <section class="mb-4">
              <shop-shopping-cart></shop-shopping-cart>
            </section>
          </div>
        </div>
      </div>
    `;
  }

  // --- Elementreferenser ---
  const productsView = document.getElementById("products-view");
  const detailsView = document.getElementById("product-details-view");

  // --- Vyhantering ---
  // När en produkt väljs: visa detaljer, dölj lista
  document.addEventListener("product:selected", () => {
    if (productsView && detailsView) {
      productsView.setAttribute("hidden", "");
      detailsView.removeAttribute("hidden");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // När detaljvyn stängs (event från product-details.js)
  document.addEventListener("details:closed", () => {
    if (productsView && detailsView) {
      productsView.removeAttribute("hidden");
      detailsView.setAttribute("hidden", "");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
