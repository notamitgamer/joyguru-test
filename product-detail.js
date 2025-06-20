document.addEventListener('DOMContentLoaded', () => {
  const webAppUrl = 'https://script.google.com/macros/s/AKfycbwKl1KA3y1r_CjHUDSvx1Ex_riNKQEGdMI7gRZcPYB4saGqVn5hcZB_Mqdjx7thJuWD/exec';
  const productDetailsDiv = document.getElementById('product-container');
  const loadingScreen = document.getElementById('loading-screen');

  // New element references for the fixed bar
  const addToCartBtn = document.getElementById('addToCartBtn');
  const goToCartBtn = document.getElementById('goToCartBtn');
  const dynamicQuantityControls = document.getElementById('dynamic-quantity-controls');
  const decreaseBtn = document.getElementById('decrease-btn');
  const increaseBtn = document.getElementById('increase-btn');
  const quantityValueElement = document.getElementById('quantity-value');

  let currentProduct = null; // Store the product globally once fetched

  // Guard clause for missing elements
  if (!productDetailsDiv || !loadingScreen || !addToCartBtn || !goToCartBtn || !dynamicQuantityControls || !decreaseBtn || !increaseBtn || !quantityValueElement) {
    console.error('One or more required HTML elements not found for product detail page.');
    return; // Stop execution if essential elements are missing
  }

  // Get product ID from URL parameter
  function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  // Asynchronously fetch product details from the web app
  async function getProductDetails(productId) {
    try {
      const response = await fetch(`${webAppUrl}?action=getProductDetails&id=${productId}`);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error); // Handle "Product not found" or other backend errors
      }
      return data.product;
    } catch (error) {
      console.error('Error fetching product details:', error);
      productDetailsDiv.innerHTML = `<p class="error-message">Failed to load product details: ${error.message}. Please try again.</p>`;
      return null; // Ensure null is returned on error for consistent handling
    }
  }

  // Add a product to the cart or update its quantity
  function updateCart(product, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let existingItemIndex = cart.findIndex(item => item.id === product.id);

    // Ensure images is always an array and pick the first one for the cart item
    const cartImage = Array.isArray(product.images) ? product.images[0] : product.images;

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      if (existingItemIndex > -1) {
        cart.splice(existingItemIndex, 1);
      }
    } else {
      if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity = quantity; // Update quantity directly
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: parseFloat(product.price),
          quantity: quantity,
          images: cartImage,
        });
      }
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Cart updated:', cart); // For debugging
    updateUIForCartStatus(product); // Update UI after cart change
  }

  // Update the quantity display and cart storage
  function updateQuantityDisplay(quantity) {
    quantityValueElement.textContent = quantity;
  }

  // Set the UI state based on whether the product is in the cart
  function updateUIForCartStatus(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      addToCartBtn.style.display = 'none';
      dynamicQuantityControls.style.display = 'flex'; // Show quantity controls
      goToCartBtn.style.display = 'inline-block'; // Show Go to Cart button
      updateQuantityDisplay(existingItem.quantity);
    } else {
      addToCartBtn.style.display = 'inline-block'; // Show Add To Cart button
      dynamicQuantityControls.style.display = 'none'; // Hide quantity controls
      goToCartBtn.style.display = 'none'; // Hide Go to Cart button
      updateQuantityDisplay(1); // Reset quantity display
    }
  }

  // Render product details on the page
  function renderProduct(product) {
    console.log('Rendering product:', product);
    if (!product) {
      productDetailsDiv.innerHTML = '<p>Product not found.</p>';
      return;
    }

    currentProduct = product; // Store the product globally

    // Ensure images is always an array
    const images = Array.isArray(product.images) ? product.images : [product.images].filter(Boolean); // Filter out empty strings/nulls
    const mainImage = images[0] || 'placeholder.jpg'; // Provide a fallback image
    const imageDotsHtml = images
      .map((_, index) => `<span class="image-dot${index === 0 ? ' active' : ''}"></span>`)
      .join('');

    // Construct the product details HTML (excluding the quantity/add to cart section)
    productDetailsDiv.innerHTML = `
      <div class="product-image-carousel">
        <img src="${mainImage}" alt="${product.name}" class="main-product-image" />
        <div class="image-dots">${imageDotsHtml}</div>
      </div>
      <div class="product-info-row">
        <div class="product-name-weight">
          <h1>${product.name}</h1>
        </div>
        <h6 class="product-price"><span class="price-label">Expected Price :</span> <span class="price-value">₹${parseFloat(product.price || 0).toFixed(2)}</span></h6>
        <p>Price per KG : ${product.priceperunit || 'N/A'} / ${product.ppu_unit || 'N/A'}</p>
        <p class="product-weight">Weight : ${product.min_weight || 'N/A'} ${product.min_unit || 'N/A'} to ${product.max_weight || 'N/A'} ${product.max_unit || 'N/A'}</p>
        <p>Product ID : ${product.id}
        <h2 style="color: #80b980;">Product Details :</h2>
        <p>${product.description || 'No description available.'}</p>
      </div>
    `;

    // Get references to newly rendered elements (for image carousel)
    const imageDots = productDetailsDiv.querySelectorAll('.image-dot');
    const mainImageElement = productDetailsDiv.querySelector('.main-product-image');
    if (mainImageElement && imageDots.length > 0) {
      imageDots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
          mainImageElement.src = images[idx];
          imageDots.forEach(d => d.classList.remove('active'));
          dot.classList.add('active');
        });
      });
    }

    // Initialize UI for cart status
    updateUIForCartStatus(currentProduct);
  }

  // --- Event Listeners for the fixed bar controls ---

  addToCartBtn.addEventListener('click', () => {
    if (currentProduct) {
      updateCart(currentProduct, 1); // Add 1 quantity to cart
    }
  });

  decreaseBtn.addEventListener('click', () => {
    if (currentProduct) {
      let qty = parseInt(quantityValueElement.textContent);
      if (qty > 1) {
        qty -= 1;
        updateCart(currentProduct, qty);
      } else {
        // If quantity drops to 0, remove from cart
        updateCart(currentProduct, 0);
      }
    }
  });

  increaseBtn.addEventListener('click', () => {
    if (currentProduct) {
      let qty = parseInt(quantityValueElement.textContent);
      qty += 1;
      updateCart(currentProduct, qty);
    }
  });

  goToCartBtn.addEventListener('click', () => {
    window.location.href = 'cart.html';
  });

  // --- Initial Page Load Logic ---
  const productId = getProductIdFromUrl();
  if (!productId) {
    productDetailsDiv.innerHTML = '<p class="error-message">Product ID is missing from the URL. Please ensure you navigate from a product listing.</p>';
    loadingScreen.style.display = 'none'; // Hide loading screen if there's an error
  } else {
    loadingScreen.style.display = 'flex'; // Show loading screen
    getProductDetails(productId)
      .then(product => {
        if (product) { // Only render if product data was successfully fetched
          renderProduct(product);
        }
      })
      .finally(() => {
        loadingScreen.style.display = 'none'; // Hide loading screen regardless of success or failure
      });
  }
});