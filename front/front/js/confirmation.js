//immediate invoked function
(() => {
  //get query string from url
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  //get the id value from the query string
  const orderId = urlParams.get('orderId');
  const orderIdElement = document.querySelector('#orderId');
  orderIdElement.innerHTML = orderId;
})();
