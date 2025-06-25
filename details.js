// Prefill email field if user is logged in and prefillEmail is set in localStorage
document.addEventListener('DOMContentLoaded', () => {
  const cartSummary = document.getElementById('cart-summary');
  const totalPriceElem = document.getElementById('total-price');
  const checkoutForm = document.getElementById('checkout-form');
  const responseMessage = document.getElementById('response-message');
  const loadingScreen = document.getElementById('loading-screen'); // Get the loading screen element
  const loadingSpinner = document.getElementById('loading-spinner'); // Get the loading spinner element

  // Initially hide the loading screen
  loadingScreen.style.display = 'none';

  // Prefill email logic from prefillEmail localStorage key (from account page)
  const prefillEmail = localStorage.getItem('prefillEmail');
  const emailInput = document.getElementById('email');
  if (emailInput && prefillEmail) {
    emailInput.value = prefillEmail;
    emailInput.readOnly = true; // Make email field non-editable
  }

  // Prefill other profile fields from profileData in localStorage
  const profileData = JSON.parse(localStorage.getItem('profileData')) || {};
  console.log('profileData on details page:', profileData);

  // Prefill other profile fields from profileData in localStorage
  const fields = ['name', 'phone', 'gender', 'roadname', 'near', 'pincode'];
  fields.forEach(field => {
    const inputElem = document.getElementById(field);
    if (inputElem) {
      if (profileData[field]) {
        inputElem.value = profileData[field];
        inputElem.readOnly = true; // Make field non-editable if found in profileData
      } else {
        inputElem.value = '';
        inputElem.readOnly = false; // Editable if not found
      }
    }
  });

  function loadCart() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
      cartSummary.innerHTML = '<center><p>Your cart is empty.</p></center>';
      totalPriceElem.textContent = 'Total Price: ₹0.00';
      checkoutForm.style.display = 'none';
      return;
    }

    let total = 0;
    let totalQuantity = 0;

    cart.forEach(item => {
      total += item.price * item.quantity;
      totalQuantity += item.quantity;
    });

    totalPriceElem.textContent = `Total Price: ₹${total.toFixed(2)}`;

    return { cart, total, totalQuantity };
  }

  function clearCart() {
    localStorage.removeItem('cart');
  }

  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    responseMessage.textContent = '';

    const { cart, total, totalQuantity } = loadCart();
    if (!cart || cart.length === 0) {
      responseMessage.textContent = 'Your cart is empty.';
      return;
    }

    // Show loading screen
    loadingScreen.style.display = 'flex';
    loadingSpinner.innerHTML = '<div style="border: 4px solid rgba(0, 0, 0, 0.1); border-top: 4px solid #ff6f61; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite;"></div>';

    const formData = new FormData(checkoutForm);
    const customerData = {
      name: formData.get('name'),
      gender: formData.get('gender'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      roadname: formData.get('roadname'),
      near: formData.get('near'),
      pincode: formData.get('pincode'),
    };

    // Prepare data to send to Google Script
    const dataToSend = {
      products: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      })),
      totalPrice: total,
      totalQuantity: totalQuantity,
      customer: customerData,
    };

    fetch('https://script.google.com/macros/s/AKfycbxAq5-NnsyCIR8tQ1n0ETlx_3CdXTv4RpXRTe9ELDLNTxjN7d9NE9oAxkJKyX7XqIu25Q/exec', {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    })
      .then(() => {
        responseMessage.textContent = 'Order placed successfully!';
        clearCart();
        checkoutForm.reset();
        loadCart();
        // Hide loading screen
        loadingScreen.style.display = 'none';
        loadingSpinner.innerHTML = '';

        // Hide response message text
        responseMessage.textContent = '';

        // Show order success popup and overlay
        const popup = document.getElementById('order-success-popup');
        const overlay = document.getElementById('popup-overlay');
        popup.style.display = 'block';
        overlay.style.display = 'block';

        // Add event listeners for buttons
        
        document.getElementById('track-order-btn').onclick = () => {
          window.location.href = 'https://joygurubasanalay.shop';
        };
      })
      .catch(() => {
        responseMessage.textContent = 'Failed to place order. Please try again.';
        // Hide loading screen
        loadingScreen.style.display = 'none';
        loadingSpinner.innerHTML = '';
      });
  });

  loadCart();
});
