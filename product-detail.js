document.addEventListener('DOMContentLoaded', () => {
  const webAppUrl = 'https://script.google.com/macros/s/AKfycbwKl1KA3y1r_CjHUDSvx1Ex_riNKQEGdMI7gRZcPYB4saGqVn5hcZB_Mqdjx7thJuWD/exec';
  const productDetailsDiv = document.getElementById('product-container');
  const loadingScreen = document.getElementById('loading-screen');

  // Get product ID from URL parameter
  function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  async function getProductDetails(productId) {
    try {
      const response = await fetch(`${webAppUrl}?action=getProductDetails&id=${productId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error); // Handle "Product not found" error
      }
      return data.product;
    } catch (error) {
      console.error('Error fetching product details:', error);
      productDetailsDiv.innerHTML = `<p>Failed to load product details: ${error.message}</p>`; // Show error on page
      return null; // Important: Return null on error
    }
  }

  function renderProduct(product) {
    if (!product) {
      productDetailsDiv.innerHTML = '<p>Product not found.</p>';
      return;
    }

    // Ensure images is always an array
    const images = Array.isArray(product.images) ? product.images : [product.images];
    const mainImage = images[0] || '';
    const imageDotsHtml = images
      .map((_, index) => `<span class="image-dot${index === 0 ? ' active' : ''}"></span>`)
      .join('');

    productDetailsDiv.innerHTML = `
      <div class="product-image-carousel">
        <img src="${mainImage}" alt="${product.name}" class="main-product-image" />
        <div class="image-dots">${imageDotsHtml}</div>
      </div>
      <div class="product-info-row">
        <div class="product-name-weight">
          <h2>${product.name}</h2>
        </div>
        <div class="product-price">₹${parseFloat(product.price).toFixed(2)}</div>
      </div>
      <div class="product-detail-section">
        <button class="section-toggle" aria-expanded="false">Product Detail <span class="arrow">&#9660;</span></button>
        <div class="section-content" style="display:none;">
          <p>${product.description}</p>
        </div>
      </div>
      <button id="addToCartBtn" class="add-to-basket-btn">Add To Cart</button>
    `;

    const addToCartButton = document.getElementById('addToCartBtn');
    const sectionToggle = productDetailsDiv.querySelector('.section-toggle');
    const sectionContent = productDetailsDiv.querySelector('.section-content');

    // Create quantity controls dynamically since they are missing in the HTML
    const quantityControls = document.createElement('div');
    quantityControls.className = 'quantity-controls';
    quantityControls.style.display = 'flex';
    quantityControls.style.alignItems = 'center';
    quantityControls.style.marginTop = '10px';
    quantityControls.style.gap = '10px';

    quantityControls.innerHTML = `
      <button id="decrease-btn" class="quantity-btn" style="background-color: #2e7d32; color: white; border: none; padding: 8px 14px; border-radius: 4px; cursor: pointer;">-</button>
      <span id="quantity-value" style="min-width: 24px; text-align: center; font-weight: bold;">1</span>
      <button id="increase-btn" class="quantity-btn" style="background-color: #2e7d32; color: white; border: none; padding: 8px 14px; border-radius: 4px; cursor: pointer;">+</button>
    `;
    addToCartButton.insertAdjacentElement('beforebegin', quantityControls);
    quantityControls.style.display = 'flex';
    quantityControls.style.justifyContent = 'center';
    quantityControls.style.marginBottom = '10px';

    const quantityValue = document.getElementById('quantity-value');
    const decreaseBtn = document.getElementById('decrease-btn');
    const increaseBtn = document.getElementById('increase-btn');

    // Image dots click to change main image
    const imageDots = productDetailsDiv.querySelectorAll('.image-dot');
    const mainImageElement = productDetailsDiv.querySelector('.main-product-image');
    imageDots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        mainImageElement.src = images[idx];
        imageDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
      });
    });

    // Toggle product detail section
    sectionToggle.addEventListener('click', () => {
      const expanded = sectionToggle.getAttribute('aria-expanded') === 'true';
      sectionToggle.setAttribute('aria-expanded', !expanded);
      sectionContent.style.display = expanded ? 'none' : 'block';
      sectionToggle.querySelector('.arrow').textContent = expanded ? '\u25BC' : '\u25B2';
    });

    function updateQuantityControls(quantity) {
      quantityValue.textContent = quantity;
    }

    decreaseBtn.addEventListener('click', () => {
      let qty = parseInt(quantityValue.textContent);
      if (qty > 1) {
        qty -= 1;
        updateQuantityControls(qty);
        updateCartQuantity(product.id, qty);
      } else {
        // Remove quantity controls and show add to cart button
        updateQuantityControls(0);
        removeFromCart(product.id);
      }
    });

    increaseBtn.addEventListener('click', () => {
      let qty = parseInt(quantityValue.textContent);
      qty += 1;
      updateQuantityControls(qty);
      updateCartQuantity(product.id, qty);
    });

    function addToCart(product) {
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      let existingItem = cart.find(item => item.id === product.id);

      if (existingItem) {
        existingItem.quantity = parseInt(document.getElementById('quantity-value').textContent);
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: parseFloat(product.price),
          quantity: parseInt(document.getElementById('quantity-value').textContent),
          images: Array.isArray(product.images) ? product.images[0] : product.images,
        });
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      // Removed alert for added to cart
      updateQuantityControls(parseInt(document.getElementById('quantity-value').textContent));
    }

    function updateCartQuantity(productId, quantity) {
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      let item = cart.find(i => i.id === productId);
      if (item) {
        item.quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(cart));
      }
    }

    function removeFromCart(productId) {
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      cart = cart.filter(i => i.id !== productId);
      localStorage.setItem('cart', JSON.stringify(cart));
      // Removed alert for removed from cart
    }

    // On page load, check if product is in cart and show quantity controls if yes
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let existingItem = cart.find(item => item.id === product.id);
    function setGoToCartState() {
      addToCartButton.textContent = 'Go to Cart';
      addToCartButton.classList.add('go-to-cart-btn');
      // Hide quantity controls
      decreaseBtn.style.display = 'none';
      increaseBtn.style.display = 'none';
      quantityValue.style.display = 'none';
      // Change button click to navigate to cart page
      addToCartButton.removeEventListener('click', addToCartClickHandler);
      addToCartButton.addEventListener('click', () => {
        window.location.href = 'cart.html';
      });
    }

    function addToCartClickHandler() {
      addToCart(product);
      setGoToCartState();
    }

    if (existingItem) {
      updateQuantityControls(existingItem.quantity);
      quantityValue.textContent = existingItem.quantity;
      setGoToCartState();
    } else {
      addToCartButton.addEventListener('click', addToCartClickHandler);
    }
  }

  const productId = getProductIdFromUrl();
  if (!productId) {
    productDetailsDiv.innerHTML = '<p>Product ID is missing from the URL.</p>';
  } else {
    loadingScreen.style.display = 'flex';
    getProductDetails(productId)
      .then(product => {
        renderProduct(product);
        loadingScreen.style.display = 'none';
      })
      .catch(() => {
        loadingScreen.style.display = 'none';
      });
  }
});
