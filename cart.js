document.addEventListener('DOMContentLoaded', () => {
  const cartContainer = document.getElementById('cart-container');
  const cartTotal = document.getElementById('cart-total');
  const checkoutButtonContainer = document.querySelector('.checkout-button-container');
  const checkoutButton = document.getElementById('open-checkout'); // Select by id directly
  const checkoutModal = document.getElementById('checkout-modal');
  const closeCheckoutBtn = document.getElementById('close-checkout');

  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let itemToRemoveIndex = null;

  const confirmationModal = document.getElementById('confirmationModal');
  const modalNoButton = document.getElementById('modalNoButton');
  const modalYesButton = document.getElementById('modalYesButton');

  function showConfirmationModal(index) {
    itemToRemoveIndex = index;
    confirmationModal.style.display = 'flex';
  }

  function hideConfirmationModal() {
    confirmationModal.style.display = 'none';
    itemToRemoveIndex = null;
  }

  modalNoButton.addEventListener('click', () => {
    hideConfirmationModal();
  });

  modalYesButton.addEventListener('click', () => {
    if (itemToRemoveIndex !== null) {
      cart.splice(itemToRemoveIndex, 1);
      localStorage.setItem('cart', JSON.stringify(cart));
      hideConfirmationModal();
      loadCart();
    }
  });

  confirmationModal.addEventListener('click', (event) => {
    if (event.target === confirmationModal) {
      hideConfirmationModal();
    }
  });

  function loadCart() {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
      cartContainer.innerHTML = '<center><p>Your cart is empty.</p><center>';
      cartTotal.innerHTML = '';
      checkoutButtonContainer.style.display = 'none';
      return;
    } else {
      checkoutButtonContainer.style.display = 'block';
    }

    let total = 0;
    let html = '<h2 style="text-align:center; margin-bottom: 20px;">My Cart</h2><div class="cart-items">';

    cart.forEach((item, index) => {
      const subtotal = item.price * item.quantity;
      total += subtotal;
      html += `
        <div class="cart-item">
          <img src="${item.images}" alt="${item.name}" class="cart-item-image" />
          <div class="cart-item-info">
            <div class="cart-item-name-weight">
              <h3>${item.name}</h3>
              <p>${item.weight || '1kg'}, Price</p>
            </div>
            <div class="cart-item-quantity">
              <button class="qty-btn" data-index="${index}" data-action="decrease">−</button>
              <span class="qty-value">${item.quantity}</span>
              <button class="qty-btn" data-index="${index}" data-action="increase">+</button>
            </div>
            <div class="cart-item-price">₹${subtotal.toFixed(2)}</div>
            <button class="remove-btn" data-index="${index}" aria-label="Remove ${item.name} from cart">×</button>
          </div>
        </div>
      `;
    });

    html += '</div>';
    cartContainer.innerHTML = html;
    checkoutButton.innerHTML = `Go to Checkout <span class="checkout-price-pill">₹${total.toFixed(2)}</span>`;
    cartTotal.innerHTML = '';

    // Update total cost in checkout modal
    const totalCostElement = document.getElementById('total-cost');
    if (totalCostElement) {
      totalCostElement.textContent = `₹${total.toFixed(2)}`;
    }

    // Add event listeners for quantity buttons
    const qtyButtons = document.querySelectorAll('.qty-btn');
    qtyButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const idx = e.target.getAttribute('data-index');
        const action = e.target.getAttribute('data-action');
        if (action === 'increase') {
          cart[idx].quantity += 1;
        } else if (action === 'decrease') {
          if (cart[idx].quantity > 1) {
            cart[idx].quantity -= 1;
          }
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCart();
      });
    });

    // Add event listeners for remove buttons
    const removeButtons = document.querySelectorAll('.remove-btn');
    removeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const idx = e.target.getAttribute('data-index');
        showConfirmationModal(parseInt(idx));
      });
    });
  }

  // Event listeners for opening and closing checkout modal
  checkoutButton.addEventListener('click', () => {
    checkoutModal.classList.remove('hidden');
    // Add show class to trigger animation
    setTimeout(() => {
      checkoutModal.classList.add('show');
    }, 10);
  });

  closeCheckoutBtn.addEventListener('click', () => {
    // Remove show class to trigger hide animation
    checkoutModal.classList.remove('show');
    // After animation ends, add hidden class to hide modal
    setTimeout(() => {
      checkoutModal.classList.add('hidden');
    }, 300);
  });

  // New event listener for place order button
  const placeOrderBtn = document.getElementById('place-order');
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent default anchor navigation
      const loginToken = localStorage.getItem('loginToken');
      if (!loginToken) {
        // Not logged in, redirect to login page
        window.location.href = 'https://joygurubasanalay.shop';
      } else {
        // Logged in, get user email and redirect to details.html with email as query param
        const userEmail = localStorage.getItem('userEmail') || '';
        // Store email in localStorage for details.html to read
        localStorage.setItem('prefillEmail', userEmail);
        window.location.href = '/details';
      }
    });
  }

  loadCart();
});
