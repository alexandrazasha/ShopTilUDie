document.addEventListener("DOMContentLoaded", () => {
  const main = document.querySelector("main");
  if (!main.querySelector("shop-categories")) {
    main.innerHTML = `
      <section id="products-view" class="mb-4">
        <shop-categories></shop-categories>
        <shop-products></shop-products>
      </section>
      <section id="product-details-view" class="mb-4" hidden>
        <shop-product-details></shop-product-details>
      </section>
      <section class="mb-4"> 
        <shop-shopping-cart></shop-shopping-cart>
      </section>
    `;
  }

  // Select elements AFTER they have been added to the DOM
  const productsView = document.getElementById("products-view");
  const detailsView = document.getElementById("product-details-view");

  // --- Vyhantering ---

  // Lyssnar på när en produkt väljs (från products.js)
  document.addEventListener("product:selected", () => {
    // Dölj produktlistan och visa detaljvyn
    if (productsView && detailsView) {
      productsView.setAttribute("hidden", "");
      detailsView.removeAttribute("hidden");
    }
    window.scrollTo({ top: 0, behavior: "smooth" }); // Skrolla till toppen
  });

  // Lyssnar på när detaljvyn stängs (från product-details.js)
  document.addEventListener("details:closed", () => {
    // Visa produktlistan och dölj detaljvyn
    if (productsView && detailsView) {
      productsView.removeAttribute("hidden");
      detailsView.setAttribute("hidden", "");
    }
    window.scrollTo({ top: 0, behavior: "smooth" }); // Skrolla till toppen
  });
});
