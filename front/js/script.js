(() => {

    const getProducts = async () => {
  
      const response = await fetch('http://localhost:3000/api/products');
  
      const products = await response.json();
  
      console.log('products', products);
      const itemsElement = document.querySelector ('.items');
      console.log ('itemsElement', itemsElement);

      const productsString = products.map( (item) => {

      return   `<a href="./product.html?id=42">
      <article>
        <img src=".../product01.jpg" alt="Lorem ipsum dolor sit amet, Kanap name1">
        <h3 class="productName">${item.name}</h3>
        <p class="productDescription">${item.description}</p>
      </article>
    </a>`})
    .join('')
  
  
  console.log(productsString);
  itemsElement.innerHTML = productsString;
};
  
getProducts();
  
  })();