//immediate invoked function
(() => {
  //cart variables
  const cartItems = document.querySelector('#cart__items');
  const totalQuantity = document.querySelector('#totalQuantity');
  const totalPrice = document.querySelector('#totalPrice');
  const cartOrderForm = document.querySelector('.cart__order__form');
  //form input variables
  const firstName = document.querySelector('#firstName');
  const firstNameErrorMsg = document.querySelector('#firstNameErrorMsg');
  const lastName = document.querySelector('#lastName');
  const lastNameErrorMsg = document.querySelector('#lastNameErrorMsg');
  const address = document.querySelector('#address');
  const addressErrorMsg = document.querySelector('#addressErrorMsg');
  const city = document.querySelector('#city');
  const cityErrorMsg = document.querySelector('#cityErrorMsg');
  const email = document.querySelector('#email');
  const emailErrorMsg = document.querySelector('#emailErrorMsg');
  //regex variables
  const nameRegex = /^[a-zA-Z ]+$/;
  const emailRegex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
  const alphanumericRegex =
    /^(?![ -.&,_'":?!/])(?!.*[- &_'":]$)(?!.*[-.#@&,:?!/]{2})[a-zA-Z0-9- .#@&,_'":.?!/]+$/;

  let dataWithPrices = [];
  let total = 0;
  //local storage name variable
  const localStorageName = 'user-shopping-cart';

  //used to populate the cart table with data from local storage
  const initCart = async () => {
    //checks to see if we have local storage data
    if (localStorage.getItem(localStorageName) === null) {
      cartOrderForm.addEventListener('submit', (event) => {
        event.preventDefault();
        alert('no items in your shopping cart, please add');
      });

      return;
    }

    //get data in local storage
    const products = JSON.parse(localStorage.getItem(localStorageName));

    //set quantity and price total to zero
    let currentTotalQuantity = 0;
    let currentPriceTotal = 0;

    for (const product of products) {
      const response = await fetch(
        `http://localhost:3000/api/products/${product.id}`
      );
      if (!response?.ok) {
        alert('oh no something has gone wrong, please contact site admin');
        return;
      }
      const productFromApi = await response.json();
      const price = productFromApi.price;

      //store the price and id together so that we can access it later
      dataWithPrices.push({
        id: product.id,
        price,
      });

      //update the html with the price data loaded from api
      cartItems.innerHTML += `
          <article class="cart__item" data-id="${product.id}" data-color="${
        product.color
      }">
            <div class="cart__item__img">
              <img src="${product.imageUrl}" alt="${product.altTxt}">
            </div>
            <div class="cart__item__content">
              <div class="cart__item__content__description">
                <h2>${product.name}</h2>
                <p>${product.color}</p>
                <p>€${price.toFixed(2)}</p>
              </div>
              <div class="cart__item__content__settings">
                <div class="cart__item__content__settings__quantity">
                  <p>Quantity : </p>
                  <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${
                    product.quantity
                  }">
                </div>
                <div class="cart__item__content__settings__delete">
                  <p class="deleteItem">Delete</p>
                </div>
              </div>
            </div>
          </article>
        `;

      //update the quantity with the current lopped item
      currentTotalQuantity = currentTotalQuantity + parseInt(product.quantity);
      totalQuantity.innerHTML = currentTotalQuantity;

      //update the price multiplied by the quantity of the current  lopped item
      currentPriceTotal =
        currentPriceTotal + parseInt(price) * parseInt(product.quantity);
      totalPrice.innerHTML = currentPriceTotal;
    }

    //now that products have been attached to dom, attach the listeners
    attachAllListeners();
  };

  //total price
  const setTotalPrice = () => {
    const products = JSON.parse(localStorage.getItem(localStorageName));
    //set total to zero
    total = 0;

    //check if we got products in local storage if not set quantity and price to 0
    if (products.length < 1) {
      totalQuantity.innerHTML = 0;
      totalPrice.innerHTML = 0;
      return;
    }

    //calculates total articles, by adding up each quantity
    const totalQuantityArticles = products.reduce((acc, curr) => {
      return parseInt(acc.quantity) + parseInt(curr.quantity);
    });

    //get price from variable and get quantity from local storage, multiply them together and add to the total price
    products.forEach((product) => {
      const quantity = product.quantity;
      const priceFromApi = dataWithPrices.find(
        (dataWithPrice) => dataWithPrice.id === product.id
      );
      total = total + parseInt(priceFromApi.price) * parseInt(quantity);
    });

    // checks to see if reduce returns a number or object, if reduce is return a object due to a single product being in the cart, than we return the current quantity of the single product item
    totalQuantity.innerHTML = totalQuantityArticles?.quantity
      ? totalQuantityArticles?.quantity
      : totalQuantityArticles;
    totalPrice.innerHTML = total;
  };

  const sendOrder = () => {
    //get data in local storage
    const products = JSON.parse(localStorage.getItem(localStorageName));
    //combine local storage data, with price data stored in array
    //however the backend only expects product ids to be posted
    // const completeProductsData = products.map((product) => {
    //   const productPriceItem = dataWithPrices.filter(
    //     (item) => item.id === product.id
    //   );
    //   return {
    //     ...product,
    //     price: productPriceItem[0].price,
    //     _id: product.id,
    //   };
    // });

    // get product ids from products array
    const getProductIds = products.map((product) => product.id);

    //create structured object to post the data in the way the backend expects it
    const formData = {
      contact: {
        firstName: firstName.value,
        lastName: lastName.value,
        address: address.value,
        city: city.value,
        email: email.value,
      },
      products: getProductIds,
    };

    //post the formdata to the backend
    fetch('http://localhost:3000/api/products//order', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(formData),
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (data.orderId) {
          //now that order id is confirmed we can clear the local storage
          localStorage.clear();

          window.location = `./confirmation.html?orderId=${data.orderId}`;
        } else {
          alert('oh no something went wrong please contact site admin');
        }
      })
      .catch((e) => {
        alert('oh no something went wrong please contact site admin');
      });
  };

  const attachAllListeners = () => {
    //on click remove item from dom and from the local storage
    cartItems.addEventListener('click', (event) => {
      if (event.target.classList.contains('deleteItem')) {
        const products = JSON.parse(localStorage.getItem(localStorageName));
        const closestProductId = event.target.closest('[data-id]');
        const productId = closestProductId.dataset.id;
        const color = event.target.closest('[data-color]').dataset.color;

        const deleteProduct = products.filter((product) => {
          if (!(product.id === productId && product.color === color)) {
            return product;
          }
        });

        localStorage.setItem(localStorageName, JSON.stringify(deleteProduct));

        // remove element from dom
        closestProductId.remove();
        setTotalPrice();
      }
    });

    // change event to update the quantity, updates local storage with new quantity and updates the dom
    cartItems.addEventListener('change', (event) => {
      if (event.target.classList.contains('itemQuantity')) {
        const products = JSON.parse(localStorage.getItem(localStorageName));
        const closestProductId = event.target.closest('[data-id]');
        const productId = closestProductId.dataset.id;
        const color = event.target.closest('[data-color]').dataset.color;
        //const itemQuantity = event.target.closest('.itemQuantity');

        const updatedProducts = products.map((product) =>
          product.color === color && product.id === productId
            ? {
                ...product,
                quantity: event.target.value,
              }
            : product
        );

        localStorage.setItem(localStorageName, JSON.stringify(updatedProducts));

        //set the value in the form

        //update the quantity and price
        setTotalPrice();
      }
    });

    //on form submit check if form is valid and send
    cartOrderForm.addEventListener('submit', (event) => {
      event.preventDefault();

      if (localStorage.getItem(localStorageName) === null) {
        alert('no items in your shopping cart, please add');
        return;
      }

      const products = JSON.parse(localStorage.getItem(localStorageName));
      let isFormValid = true;

      //check if we got any products in storage, if not than promt user to add products
      if (products.length < 1) {
        alert('please add products to your cart');
        return;
      }

      //test if first name is valid
      if (!nameRegex.test(firstName.value)) {
        isFormValid = false;
        firstNameErrorMsg.innerHTML = "That's an invalid first name.";
      } else {
        firstNameErrorMsg.innerHTML = '';
      }

      //test if first name is valid
      if (!nameRegex.test(lastName.value)) {
        isFormValid = false;
        lastNameErrorMsg.innerHTML = "That's an invalid last name.";
      } else {
        lastNameErrorMsg.innerHTML = '';
      }

      //test if address is valid
      if (!alphanumericRegex.test(address.value)) {
        isFormValid = false;
        addressErrorMsg.innerHTML = "That's an invalid address.";
      } else {
        addressErrorMsg.innerHTML = '';
      }

      //test if city is valid
      if (!nameRegex.test(city.value)) {
        isFormValid = false;
        cityErrorMsg.innerHTML = "That's an invalid city.";
      } else {
        cityErrorMsg.innerHTML = '';
      }

      //test if email is valid

      if (!email.value.match(emailRegex)) {
        isFormValid = false;
        emailErrorMsg.innerHTML = "That's an invalid email.";
      } else {
        emailErrorMsg.innerHTML = '';
      }

      if (!isFormValid) {
        return;
      }

      //if the form is valid, we shall submit the data to the server
      sendOrder();
    });
  };

  //begin execution of cart logic
  initCart();
})();
