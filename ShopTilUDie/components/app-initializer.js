document.addEventListener("DOMContentLoaded", () => {
  const main = document.querySelector("main");
  if (!main.querySelector("shop-categories")) {
    main.innerHTML = `
      <section class="mb-4">
        <shop-categories></shop-categories>
      </section>
      <section class="mb-4">
        <shop-products></shop-products>
      </section>
      <section class="mb-4">
        <shop-product-details></shop-product-details>
      </section>
      <section class="mb-4">
        <shop-shopping-cart></shop-shopping-cart>
      </section>
    `;
  }
});
