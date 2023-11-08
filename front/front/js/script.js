//immediate invoked function
(() => {
  //function to get the products
  const getProducts = async () => {
    const response = await fetch('http://localhost:3000/api/products');
    const products = await response.json();
    const itemsElement = document.querySelector('.items');

    const productsString = products
      .map((item) => {
        return `
        <a href="./product.html?id=${item._id}">
          <article>
            <img src="${item.imageUrl}" alt="${item.altTxt}">
            <h3 class="productName">${item.name}</h3>
            <p class="productDescription">${item.description}</p>
          </article>
        </a>
      `;
      })
      .join('');

    itemsElement.innerHTML = productsString;
  };

  getProducts();
})();
