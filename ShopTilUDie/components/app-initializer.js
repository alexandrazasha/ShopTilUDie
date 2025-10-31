// components/app-initializer.js
// Initierar sidans layout och hanterar vybyte mellan produktlista och produktdetaljer.

document.addEventListener("DOMContentLoaded", () => {
  // Hämtar huvudtaggar i DOM
  const main = document.querySelector("main");
  const body = document.querySelector("body");

  // Skapar grundlayouten med Bootstrap-container och rader
  // Görs bara om kategorikomponenten inte redan finns
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
          </div>
        </div>
      </div>
    `;
  }

  // Hämtar sektionerna för att kunna växla mellan dem
  const productsView = document.getElementById("products-view");
  const detailsView = document.getElementById("product-details-view");

  // Lyssnar på händelsen "product:selected" som triggas från shop-products
  // Döljer produktlistan och visar detaljvyn när en produkt väljs
  document.addEventListener("product:selected", () => {
    if (productsView && detailsView) {
      productsView.setAttribute("hidden", "");
      detailsView.removeAttribute("hidden");
    }
    // Scrollar upp till toppen för att visa produktdetaljerna direkt
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Lyssnar på händelsen "details:closed" som triggas från product-details
  // Visar produktlistan igen när användaren stänger detaljvyn
  document.addEventListener("details:closed", () => {
    if (productsView && detailsView) {
      productsView.removeAttribute("hidden");
      detailsView.setAttribute("hidden", "");
    }
    // Scrollar upp till toppen även här för konsekvent beteende
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

