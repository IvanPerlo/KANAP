//immediate invoked function
(() => {
  //get query string from url
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  //get the id value from the query string
  const productId = urlParams.get('id');
  //local storage name
  const localStorageName = 'user-shopping-cart';

  //dom selectors
  const productImage = document.querySelector('.item__img');
  const productPrice = document.querySelector('#price');
  const productDescription = document.querySelector('#description');
  const productColors = document.querySelector('#colors');
  const addToCart = document.querySelector('#addToCart');
  const quantity = document.querySelector('#quantity');
  let imageUrl = '';
  let altTxt = '';
  let productName = '';

  //variables
  let selectedColor = '';

  //api call to get single product by id
  const getSingleProduct = async (id) => {
    const response = await fetch(`http://localhost:3000/api/products/${id}`);
    const product = await response.json();
    imageUrl = product.imageUrl;
    altTxt = product.altTxt;
    productName = product.name;

    productImage.innerHTML = `<img src="${imageUrl}" alt="${altTxt}">`;
    productPrice.innerHTML = product.price;
    productDescription.innerHTML = product.description;

    //insert select option into the html dynamically, based on the color array from the api
    productColors.insertAdjacentHTML(
      'beforeend',
      product.colors
        .map((color) => {
          return `<option value="${color}">${color}</option>`;
        })
        .join('')
    );
  };

  // redirection for the cart page
  const gotoCartPage = () => {
    window.location = './cart.html';
  };

  //stores data into local storage
  const productToLocalStorage = (data) => {
    localStorage.setItem(localStorageName, JSON.stringify(data));
  };

  //add product item to local storage and redirects to cart page
  const addItemsToCart = () => {
    if (!selectedColor || !parseInt(quantity.value)) {
      alert('please select a color or/and quantity');
      return;
    }

    //store existing selected color and quantity in object and the product id from url
    const productItem = {
      quantity: quantity.value,
      id: productId,
      color: selectedColor,
      imageUrl: imageUrl,
      altTxt: altTxt,
      name: productName,
    };

    //checks to see if we have local storage data
    if (localStorage.getItem(localStorageName) === null) {
      productToLocalStorage([productItem]);
      gotoCartPage();
      return;
    }

    //get data in local storage
    const products = JSON.parse(localStorage.getItem(localStorageName));
    //find if we have an existing product with same color and is
    const productExists = products.find(
      (product) => product.color === selectedColor && product.id === productId
    );

    //if we have existing product, than update the quantity
    if (productExists) {
      const updatedProducts = products.map((product) =>
        product.color === selectedColor && product.id === productId
          ? {
              ...product,
              quantity: parseInt(product.quantity) + parseInt(quantity.value),
            }
          : product
      );
      productToLocalStorage(updatedProducts);
    } else {
      //if no existing product, than add product to the array
      products.push(productItem);
      productToLocalStorage(products);
    }
    gotoCartPage();
  };

  //stores color change in a variable
  const updateColor = (e) => {
    selectedColor = e.target.value;
  };

  //initialize by getting single product data
  getSingleProduct(productId);

  //event listeners
  addToCart.addEventListener('click', addItemsToCart);
  productColors.addEventListener('change', updateColor);
})();
