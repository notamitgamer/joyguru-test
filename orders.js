const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzRe9XCtSufwOMrzkRtrdzCZLwhLs6CnLcvL-t2skAff8zNXx_rIS5OrdkJ8iEbE9gJ/exec'; // *** IMPORTANT: REPLACE WITH YOUR DEPLOYED SCRIPT URL ***

document.addEventListener('DOMContentLoaded', () => {
  const ordersContent = document.getElementById('orders-content');
  const loadingScreen = document.getElementById('loading-screen');
  const userEmail = localStorage.getItem('userEmail');
  const loginToken = localStorage.getItem('loginToken');

  if (!loginToken || !userEmail) {
    // Redirect to login if not logged in
    window.location.href = '/login';
    return;
  }

  fetchOrders(userEmail);

  function fetchOrders(email) {
    loadingScreen.style.display = 'flex';
    // Removed the line that sets ordersContent.textContent to avoid showing loading text background
    fetch(`${GOOGLE_SCRIPT_URL}?action=getOrders&email=${encodeURIComponent(email)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        loadingScreen.style.display = 'none';
        if (data.success) {
          displayOrders(data.orders);
        } else {
          ordersContent.textContent = 'Failed to load orders: ' + (data.message || 'Unknown error');
        }
      })
      .catch(error => {
        loadingScreen.style.display = 'none';
        console.error('Error fetching orders:', error);
        ordersContent.textContent = 'Error fetching orders. Please try again later. Details: ' + error.message;
      });
  }

  function displayOrders(orders) {
    if (!orders || orders.length === 0) {
      ordersContent.innerHTML = '<p class="no-orders">You have no past orders.</p>';
      return;
    }

    ordersContent.innerHTML = ''; 

    orders.forEach(order => {
      const card = document.createElement('div');
      card.className = 'order-card';

      // Create four divs for four corners
      const orderDate = document.createElement('div');
      // Format order date to readable string
      let rawDate = order['Order Date'] || order['orderDate'] || '';
      let formattedDate = rawDate;
      if (rawDate) {
        try {
          const dateObj = new Date(rawDate);
          if (!isNaN(dateObj)) {
            formattedDate = dateObj.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          }
        } catch (e) {
          // fallback to rawDate if parsing fails
          formattedDate = rawDate;
        }
      }
      //------order product details---------
      orderDate.textContent = `Order Date: ${formattedDate}`;
      orderDate.style.gridColumn = '1 / 2';
      orderDate.style.gridRow = '1 / 2';
      orderDate.style.fontWeight = 'bold';

      const orderId = document.createElement('div');
      orderId.textContent = `Order ID: ${order['Order ID'] || order['orderId'] || ''}`;
      orderId.style.gridColumn = '2 / 3';
      orderId.style.gridRow = '1 / 2';
      orderId.style.textAlign = 'right';
      orderId.style.fontWeight = 'bold';

      const totalPrice = document.createElement('div');
      totalPrice.textContent = `Total Price: ${order['Total Price'] || order['totalPrice'] || ''}`;
      totalPrice.style.gridColumn = '1 / 2';
      totalPrice.style.gridRow = '2 / 3';
      totalPrice.style.color = '#2e7d32';

      const status = document.createElement('div');
      status.textContent = `Status: ${order['Status'] || order['status'] || ''}`;
      status.style.gridColumn = '2 / 3';
      status.style.gridRow = '2 / 3';
      status.style.textAlign = 'right';
      status.style.color = '#555';

      card.appendChild(orderDate);
      card.appendChild(orderId);
      card.appendChild(totalPrice);
      card.appendChild(status);

      ordersContent.appendChild(card);
    });
  }
});
