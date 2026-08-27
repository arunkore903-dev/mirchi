/* ==========================================================================
   MIRCHI PURE - STOREFRONT CONTROLLER
   Catalog Rendering, Weight Pickers, Cart Drawer, Checkout, Modals, Recipes
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  renderProducts();
  renderProcessSteps();
  renderRecipes();
  renderReviews();
  updateCartUI();
  updateWishlistUI();
  setupEventListeners();
}

// --------------------------------------------------------------------------
// Event Listeners Registration
// --------------------------------------------------------------------------
function setupEventListeners() {
  // Store state change listeners
  window.addEventListener('mp:cart-changed', () => updateCartUI());
  window.addEventListener('mp:wishlist-changed', () => {
    updateWishlistUI();
    renderProducts(); // Re-render product wishlist hearts
  });
  window.addEventListener('mp:products-changed', () => renderProducts());

  // Category Filtering
  const filterPills = document.querySelectorAll('.filter-pill');
  filterPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      filterPills.forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
      const category = e.target.getAttribute('data-category');
      renderProducts(category);
    });
  });

  // Search input
  const searchInput = document.getElementById('catalog-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderProducts('All', e.target.value.toLowerCase());
    });
  }

  // Cart Drawer Toggles
  const cartBtns = document.querySelectorAll('[data-action="open-cart"]');
  cartBtns.forEach(btn => btn.addEventListener('click', openCartDrawer));

  const closeCartBtn = document.getElementById('close-cart-drawer');
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);

  const cartBackdrop = document.getElementById('cart-backdrop');
  if (cartBackdrop) {
    cartBackdrop.addEventListener('click', (e) => {
      if (e.target === cartBackdrop) closeCartDrawer();
    });
  }

  // Checkout Modal Trigger
  const proceedCheckoutBtn = document.getElementById('proceed-checkout-btn');
  if (proceedCheckoutBtn) proceedCheckoutBtn.addEventListener('click', openCheckoutModal);

  // Apply Coupon
  const applyCouponBtn = document.getElementById('apply-coupon-btn');
  if (applyCouponBtn) {
    applyCouponBtn.addEventListener('click', () => {
      const codeInput = document.getElementById('coupon-input');
      if (codeInput && codeInput.value) {
        const res = store.applyCoupon(codeInput.value);
        showToast(res.message, res.success ? 'success' : 'error');
      }
    });
  }

  // Checkout Form Submission
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleOrderSubmit();
    });
  }

  // Order Tracking Modal Triggers
  const trackBtns = document.querySelectorAll('[data-action="open-tracker"]');
  trackBtns.forEach(btn => btn.addEventListener('click', openTrackerModal));

  const trackForm = document.getElementById('tracking-form');
  if (trackForm) {
    trackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleTrackingSearch();
    });
  }

  // WhatsApp Order Modal Trigger
  const whatsappBtns = document.querySelectorAll('[data-action="open-whatsapp-order"]');
  whatsappBtns.forEach(btn => btn.addEventListener('click', openWhatsAppModal));

  // Portal View Switcher (Storefront <-> Admin)
  const modeSwitchBtns = document.querySelectorAll('[data-action="toggle-admin-mode"]');
  modeSwitchBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const newMode = store.viewMode === 'store' ? 'admin' : 'store';
      store.viewMode = newMode;
      store.saveState();
      toggleViewModeUI();
    });
  });

  // Modal Close buttons
  const modalCloseBtns = document.querySelectorAll('.modal-close-btn, [data-action="close-modal"]');
  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-wrapper');
      if (modal) modal.classList.remove('active');
    });
  });

  // Close modals on backdrop click
  const modals = document.querySelectorAll('.modal-wrapper');
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  });

  // Initial View Mode Setup
  toggleViewModeUI();
}

// --------------------------------------------------------------------------
// Store View vs Admin View Toggle
// --------------------------------------------------------------------------
function toggleViewModeUI() {
  const storeView = document.getElementById('store-view');
  const adminPortal = document.getElementById('admin-portal');

  if (store.viewMode === 'admin') {
    if (storeView) storeView.style.display = 'none';
    if (adminPortal) {
      adminPortal.classList.add('active');
      if (window.renderAdminDashboard) window.renderAdminDashboard();
    }
  } else {
    if (storeView) storeView.style.display = 'block';
    if (adminPortal) adminPortal.classList.remove('active');
  }
}

// --------------------------------------------------------------------------
// Product Catalog Rendering & Weight Selection Logic
// --------------------------------------------------------------------------
function renderProducts(categoryFilter = 'All', searchFilter = '') {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  let products = store.getProducts();

  if (categoryFilter !== 'All') {
    products = products.filter(p => p.category === categoryFilter);
  }

  if (searchFilter) {
    products = products.filter(p =>
      p.name.toLowerCase().includes(searchFilter) ||
      p.description.toLowerCase().includes(searchFilter)
    );
  }

  if (products.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem;">
        <i class="fa-solid fa-pepper-hot" style="font-size: 3rem; color: var(--clr-text-muted);"></i>
        <h3 style="margin-top: 1rem;">No Chilli Products Found</h3>
        <p style="color: var(--clr-text-muted);">Try adjusting your search or category filter.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(product => {
    const isWish = store.isWishlisted(product.id);
    const activeVarIdx = product.activeVariantIndex !== undefined ? product.activeVariantIndex : product.defaultVariantIndex;
    const variant = product.variants[activeVarIdx];

    // Build flame heat indicators
    let flamesHtml = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= product.spiceLevel) {
        flamesHtml += `<i class="fa-solid fa-fire flame-icon"></i>`;
      } else {
        flamesHtml += `<i class="fa-solid fa-fire" style="color: var(--clr-border);"></i>`;
      }
    }

    return `
      <div class="product-card" id="card-${product.id}">
        <div class="card-top-badges">
          <span class="badge badge-gold">${product.badge || 'Fresh Batch'}</span>
          <button class="wishlist-btn ${isWish ? 'active' : ''}" onclick="toggleWishlistHandler('${product.id}')" title="Wishlist">
            <i class="${isWish ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}"></i>
          </button>
        </div>

        <div class="product-img-box" onclick="openProductDetailModal('${product.id}')">
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
        </div>

        <div class="product-content">
          <div class="spice-level-indicator">
            ${flamesHtml}
            <span>${product.spiceText}</span>
          </div>

          <h3 class="product-title" onclick="openProductDetailModal('${product.id}')">${product.name}</h3>
          <p class="product-short-desc">${product.description}</p>

          <div class="weight-selector-label">Select Pack Size:</div>
          <div class="weight-pills">
            ${product.variants.map((v, idx) => `
              <button class="weight-pill-btn ${idx === activeVarIdx ? 'active' : ''}"
                onclick="selectWeightVariant('${product.id}', ${idx})">
                ${v.weight}
              </button>
            `).join('')}
          </div>

          <div class="price-row">
            <span class="current-price">₹${variant.price}</span>
            ${variant.originalPrice ? `<span class="original-price">₹${variant.originalPrice}</span>` : ''}
          </div>

          <div class="product-card-actions">
            <button class="btn btn-secondary" style="padding: 0.65rem 0.8rem; font-size: 0.88rem;"
              onclick="handleAddToCart('${product.id}', ${activeVarIdx})">
              <i class="fa-solid fa-basket-shopping"></i> Add to Cart
            </button>
            <button class="btn btn-primary" style="padding: 0.65rem 0.8rem; font-size: 0.88rem;"
              onclick="handleBuyNow('${product.id}', ${activeVarIdx})">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Handler for weight variant selection in product card
window.selectWeightVariant = function(productId, variantIdx) {
  const product = store.getProductById(productId);
  if (product) {
    product.activeVariantIndex = variantIdx;
    renderProducts();
  }
};

window.toggleWishlistHandler = function(productId) {
  store.toggleWishlist(productId);
  const isWish = store.isWishlisted(productId);
  showToast(isWish ? 'Added to Wishlist!' : 'Removed from Wishlist', 'info');
};

window.handleAddToCart = function(productId, variantIdx) {
  store.addToCart(productId, variantIdx, 1);
  showToast("Added to Cart!", "success");
};

window.handleBuyNow = function(productId, variantIdx) {
  store.addToCart(productId, variantIdx, 1);
  openCartDrawer();
};

// --------------------------------------------------------------------------
// Product Detail Modal
// --------------------------------------------------------------------------
window.openProductDetailModal = function(productId) {
  const product = store.getProductById(productId);
  if (!product) return;

  const modal = document.getElementById('product-detail-modal');
  const container = document.getElementById('product-detail-container');
  if (!modal || !container) return;

  const activeVarIdx = product.activeVariantIndex !== undefined ? product.activeVariantIndex : product.defaultVariantIndex;
  let currentSelectedVariantIdx = activeVarIdx;

  function renderModalInner() {
    const variant = product.variants[currentSelectedVariantIdx];

    container.innerHTML = `
      <div class="product-detail-grid">
        <div style="border-radius: var(--radius-lg); overflow: hidden; height: 380px; box-shadow: var(--shadow-md);">
          <img src="${product.image}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover;" />
        </div>

        <div>
          <span class="badge badge-red" style="margin-bottom: 0.8rem;">${product.category}</span>
          <h2 style="font-family: var(--ff-heading); margin-bottom: 0.5rem; color: var(--clr-deep-red);">${product.name}</h2>
          
          <div style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1rem;">
            <div style="color: #FFC107; font-size: 0.9rem;">
              <i class="fa-solid fa-star"></i> ${product.rating} (${product.reviewsCount} Verified Reviews)
            </div>
            <span class="badge badge-green">${product.spiceText}</span>
          </div>

          <p style="color: var(--clr-text-body); margin-bottom: 1.5rem;">${product.description}</p>

          <div style="margin-bottom: 1.2rem;">
            <div class="weight-selector-label">Available Weights:</div>
            <div class="weight-pills">
              ${product.variants.map((v, idx) => `
                <button class="weight-pill-btn ${idx === currentSelectedVariantIdx ? 'active' : ''}"
                  id="detail-var-${idx}">
                  ${v.weight}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="price-row" style="margin-bottom: 1.8rem;">
            <span class="current-price" style="font-size: 2rem;">₹${variant.price}</span>
            ${variant.originalPrice ? `<span class="original-price" style="font-size: 1.2rem;">₹${variant.originalPrice}</span>` : ''}
            <span style="font-size: 0.85rem; color: var(--clr-dark-green); font-weight: 600;">(Inclusive of all taxes)</span>
          </div>

          <div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
            <button class="btn btn-primary" style="flex: 1;" id="modal-add-cart-btn">
              <i class="fa-solid fa-basket-shopping"></i> Add to Cart
            </button>
            <button class="btn btn-gold" style="flex: 1;" id="modal-buy-now-btn">
              Buy Now
            </button>
          </div>

          <!-- Trust bullets -->
          <div style="background: var(--clr-cream-bg); padding: 1rem; border-radius: var(--radius-md); font-size: 0.85rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem;">
            <div><i class="fa-solid fa-circle-check text-green"></i> 100% Quality Chilli</div>
            <div><i class="fa-solid fa-circle-check text-green"></i> Hygienically Prepared</div>
            <div><i class="fa-solid fa-circle-check text-green"></i> Freshly Packed</div>
            <div><i class="fa-solid fa-circle-check text-green"></i> Authentic Indian Taste</div>
          </div>
        </div>
      </div>

      <!-- Detail Tabs Section -->
      <div class="detail-tabs">
        <button class="tab-btn active" data-tab="tab-love">Why You'll Love It</button>
        <button class="tab-btn" data-tab="tab-prep">Preparation & Ingredients</button>
        <button class="tab-btn" data-tab="tab-storage">Packaging & Shelf Life</button>
      </div>

      <div class="tab-content-panel active" id="tab-love">
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.6rem;">
          ${product.whyYouLoveIt.map(item => `
            <li style="display: flex; align-items: center; gap: 0.6rem;">
              <i class="fa-solid fa-pepper-hot text-red"></i> <span>${item}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="tab-content-panel" id="tab-prep">
        <p><strong>Ingredients:</strong> ${product.ingredients}</p>
        <p style="margin-top: 0.6rem;"><strong>Preparation Process:</strong> ${product.prepProcess}</p>
      </div>

      <div class="tab-content-panel" id="tab-storage">
        <p><strong>Packaging:</strong> ${product.packaging}</p>
        <p style="margin-top: 0.6rem;"><strong>Storage Instructions:</strong> ${product.storage}</p>
        <p style="margin-top: 0.6rem;"><strong>Shelf Life:</strong> ${product.shelfLife}</p>
      </div>
    `;

    // Attach internal listeners for variants & tabs inside modal
    product.variants.forEach((v, idx) => {
      const vBtn = container.querySelector(`#detail-var-${idx}`);
      if (vBtn) {
        vBtn.addEventListener('click', () => {
          currentSelectedVariantIdx = idx;
          renderModalInner();
        });
      }
    });

    const addCartBtn = container.querySelector('#modal-add-cart-btn');
    if (addCartBtn) {
      addCartBtn.addEventListener('click', () => {
        store.addToCart(product.id, currentSelectedVariantIdx, 1);
        showToast("Added to Cart!", "success");
        modal.classList.remove('active');
      });
    }

    const buyNowBtn = container.querySelector('#modal-buy-now-btn');
    if (buyNowBtn) {
      buyNowBtn.addEventListener('click', () => {
        store.addToCart(product.id, currentSelectedVariantIdx, 1);
        modal.classList.remove('active');
        openCartDrawer();
      });
    }

    // Tabs switching
    const tabBtns = container.querySelectorAll('.tab-btn');
    const tabPanels = container.querySelectorAll('.tab-content-panel');
    tabBtns.forEach(tBtn => {
      tBtn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));
        tBtn.classList.add('active');
        const targetId = tBtn.getAttribute('data-tab');
        const targetPanel = container.querySelector(`#${targetId}`);
        if (targetPanel) targetPanel.classList.add('active');
      });
    });
  }

  renderModalInner();
  modal.classList.add('active');
};

// --------------------------------------------------------------------------
// Cart Drawer UI & Updating
// --------------------------------------------------------------------------
function openCartDrawer() {
  const backdrop = document.getElementById('cart-backdrop');
  if (backdrop) backdrop.classList.add('active');
}

function closeCartDrawer() {
  const backdrop = document.getElementById('cart-backdrop');
  if (backdrop) backdrop.classList.remove('active');
}

function updateCartUI() {
  const badgeCounts = document.querySelectorAll('.cart-count');
  const cartItemCount = store.cart.reduce((sum, i) => sum + i.qty, 0);
  badgeCounts.forEach(el => el.textContent = cartItemCount);

  const container = document.getElementById('cart-items-container');
  const subtotalEl = document.getElementById('cart-subtotal-val');
  const discountEl = document.getElementById('cart-discount-val');
  const shippingEl = document.getElementById('cart-shipping-val');
  const totalEl = document.getElementById('cart-total-val');
  const freeShipBar = document.getElementById('free-shipping-progress');
  const freeShipText = document.getElementById('free-shipping-msg');

  if (!container) return;

  const subtotal = store.getCartSubtotal();
  const discount = store.getDiscountAmount();
  const shipping = store.getShippingFee();
  const total = store.getCartTotal();

  // Free shipping progress logic (Threshold ₹499)
  const threshold = 499;
  if (subtotal >= threshold || (store.appliedCoupon && store.appliedCoupon.freeShipping)) {
    if (freeShipBar) freeShipBar.style.width = '100%';
    if (freeShipText) freeShipText.innerHTML = `🎉 You unlocked <strong>FREE Doorstep Delivery!</strong>`;
  } else {
    const diff = threshold - subtotal;
    const pct = Math.min(100, Math.round((subtotal / threshold) * 100));
    if (freeShipBar) freeShipBar.style.width = `${pct}%`;
    if (freeShipText) freeShipText.innerHTML = `Add <strong>₹${diff}</strong> more to get FREE Doorstep Delivery!`;
  }

  if (store.cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--clr-text-muted);">
        <i class="fa-solid fa-basket-shopping" style="font-size: 3.5rem; margin-bottom: 1rem; color: var(--clr-border);"></i>
        <h4>Your Cart is Empty</h4>
        <p style="font-size: 0.9rem; margin-top: 0.4rem;">Explore our freshly prepared chilli powders and stock up your kitchen!</p>
      </div>
    `;
  } else {
    container.innerHTML = store.cart.map((item, idx) => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
        <div class="cart-item-details">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <span class="cart-item-title">${item.name}</span>
              <div class="cart-item-meta">Pack: ${item.weight}</div>
            </div>
            <button onclick="store.removeFromCart(${idx})" style="color: var(--clr-text-muted); font-size: 1rem;">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
            <div class="qty-controls">
              <button class="qty-btn" onclick="store.updateCartQty(${idx}, ${item.qty - 1})">-</button>
              <span style="font-size: 0.9rem; font-weight: 700; width: 20px; text-align: center;">${item.qty}</span>
              <button class="qty-btn" onclick="store.updateCartQty(${idx}, ${item.qty + 1})">+</button>
            </div>
            <span class="cart-item-price">₹${item.price * item.qty}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
  if (discountEl) discountEl.textContent = discount > 0 ? `-₹${discount}` : `₹0`;
  if (shippingEl) shippingEl.textContent = shipping === 0 ? `FREE` : `₹${shipping}`;
  if (totalEl) totalEl.textContent = `₹${total}`;
}

function updateWishlistUI() {
  const wishBadgeCounts = document.querySelectorAll('.wishlist-count');
  wishBadgeCounts.forEach(el => el.textContent = store.wishlist.length);
}

// --------------------------------------------------------------------------
// Checkout Modal Flow
// --------------------------------------------------------------------------
function openCheckoutModal() {
  if (store.cart.length === 0) {
    showToast("Your cart is empty! Add items first.", "error");
    return;
  }
  closeCartDrawer();
  const modal = document.getElementById('checkout-modal');
  const summaryEl = document.getElementById('checkout-order-summary');

  if (summaryEl) {
    summaryEl.innerHTML = store.cart.map(item => `
      <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.4rem;">
        <span>${item.name} (${item.weight}) x${item.qty}</span>
        <strong>₹${item.price * item.qty}</strong>
      </div>
    `).join('') + `
      <div style="border-top: 1px dashed var(--clr-border); padding-top: 0.6rem; margin-top: 0.6rem; display: flex; justify-content: space-between; font-weight: 800; color: var(--clr-deep-red); font-size: 1.1rem;">
        <span>Total Payable</span>
        <span>₹${store.getCartTotal()}</span>
      </div>
    `;
  }

  if (modal) modal.classList.add('active');
}

function handleOrderSubmit() {
  const name = document.getElementById('cust-name').value;
  const phone = document.getElementById('cust-phone').value;
  const email = document.getElementById('cust-email').value;
  const address = document.getElementById('cust-address').value;
  const city = document.getElementById('cust-city').value;
  const pincode = document.getElementById('cust-pincode').value;
  const paymentMode = document.querySelector('input[name="payment-mode"]:checked').value;

  if (!name || !phone || !address || !city || !pincode) {
    showToast("Please fill in all mandatory address fields.", "error");
    return;
  }

  const newOrder = store.createOrder({
    name, phone, email, address, city, pincode, paymentMode
  });

  const checkoutModal = document.getElementById('checkout-modal');
  if (checkoutModal) checkoutModal.classList.remove('active');

  // Trigger celebration confetti if canvas script exists
  if (window.confetti) {
    window.confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  }

  // Open Order Success Modal
  openOrderSuccessModal(newOrder);
}

function openOrderSuccessModal(order) {
  const modal = document.getElementById('order-success-modal');
  const detailsContainer = document.getElementById('order-success-details');
  if (!modal || !detailsContainer) return;

  detailsContainer.innerHTML = `
    <div style="text-align: center; margin-bottom: 1.5rem;">
      <div style="width: 70px; height: 70px; background: #E8F5E9; color: var(--clr-dark-green); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 1rem;">
        <i class="fa-solid fa-circle-check"></i>
      </div>
      <h2 style="color: var(--clr-deep-red); margin-bottom: 0.3rem;">Order Placed Successfully!</h2>
      <p style="font-size: 0.95rem;">Order Reference ID: <strong style="color: var(--clr-chilli-red); font-size: 1.1rem;">${order.orderId}</strong></p>
    </div>

    <div style="background: var(--clr-cream-bg); border-radius: var(--radius-md); padding: 1.2rem; margin-bottom: 1.5rem; font-size: 0.9rem;">
      <p><strong>Customer:</strong> ${order.customerName} (${order.phone})</p>
      <p style="margin-top: 0.4rem;"><strong>Delivery Address:</strong> ${order.address}</p>
      <p style="margin-top: 0.4rem;"><strong>Payment Mode:</strong> ${order.paymentMode} (${order.paymentStatus})</p>
      <p style="margin-top: 0.4rem;"><strong>Total Paid:</strong> ₹${order.totalAmount}</p>
    </div>

    <div style="display: flex; gap: 1rem;">
      <button class="btn btn-primary" style="flex: 1;" onclick="openTrackerModalWithId('${order.orderId}')">
        <i class="fa-solid fa-truck-fast"></i> Track Order Status
      </button>
      <button class="btn btn-secondary" style="flex: 1;" onclick="document.getElementById('order-success-modal').classList.remove('active')">
        Continue Shopping
      </button>
    </div>
  `;

  modal.classList.add('active');
}

// --------------------------------------------------------------------------
// Order Tracker Modal
// --------------------------------------------------------------------------
function openTrackerModal() {
  const modal = document.getElementById('tracker-modal');
  if (modal) modal.classList.add('active');
}

window.openTrackerModalWithId = function(orderId) {
  const successModal = document.getElementById('order-success-modal');
  if (successModal) successModal.classList.remove('active');

  const trackerInput = document.getElementById('tracker-input');
  if (trackerInput) trackerInput.value = orderId;
  
  openTrackerModal();
  handleTrackingSearch();
};

function handleTrackingSearch() {
  const input = document.getElementById('tracker-input');
  const resultBox = document.getElementById('tracking-result-box');
  if (!input || !resultBox) return;

  const order = store.findOrder(input.value);

  if (!order) {
    resultBox.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--clr-chilli-red);">
        <i class="fa-solid fa-circle-exclamation" style="font-size: 2.5rem;"></i>
        <h4 style="margin-top: 0.5rem;">Order Not Found</h4>
        <p style="font-size: 0.88rem; color: var(--clr-text-muted);">Please check your Order ID (e.g., MRC-84920) or Phone number.</p>
      </div>
    `;
    return;
  }

  resultBox.innerHTML = `
    <div style="background: #FFF; border: 1px solid var(--clr-border); border-radius: var(--radius-md); padding: 1.2rem; margin-top: 1rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--clr-border-light); padding-bottom: 0.8rem; margin-bottom: 1rem;">
        <div>
          <h4 style="color: var(--clr-deep-red);">Order ID: ${order.orderId}</h4>
          <span style="font-size: 0.8rem; color: var(--clr-text-muted);">Placed on: ${order.date}</span>
        </div>
        <span class="badge ${order.orderStatus === 'Delivered' ? 'badge-green' : 'badge-gold'}">
          ${order.orderStatus}
        </span>
      </div>

      <div style="margin-bottom: 1rem; font-size: 0.88rem;">
        <strong>Items Ordered:</strong>
        <ul style="list-style: none; margin-top: 0.4rem; color: var(--clr-text-body);">
          ${order.items.map(i => `<li>• ${i.name} x${i.qty} - ₹${i.price * i.qty}</li>`).join('')}
        </ul>
      </div>

      <!-- Tracking Steps Visual Line -->
      <div style="position: relative; padding-left: 1.5rem; border-left: 3px solid var(--clr-border); display: flex; flex-direction: column; gap: 1.2rem;">
        ${order.trackingSteps.map(s => `
          <div style="position: relative;">
            <div style="position: absolute; left: -1.95rem; top: 0; width: 16px; height: 16px; border-radius: 50%; background: ${s.done ? 'var(--clr-chilli-red)' : 'var(--clr-border)'}; border: 3px solid #FFF;"></div>
            <div style="font-family: var(--ff-ui); font-weight: ${s.done ? '700' : '500'}; font-size: 0.9rem; color: ${s.done ? 'var(--clr-heading-dark)' : 'var(--clr-text-muted)'};">
              ${s.step}
            </div>
            <div style="font-size: 0.78rem; color: var(--clr-text-muted);">${s.time}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// WhatsApp Ordering Integration Modal
// --------------------------------------------------------------------------
function openWhatsAppModal() {
  const modal = document.getElementById('whatsapp-modal');
  const previewText = document.getElementById('whatsapp-message-preview');
  if (!modal || !previewText) return;

  let message = `Namaste Mirchi Pure! I would like to place a fresh chilli powder order:\n\n`;
  if (store.cart.length > 0) {
    store.cart.forEach((i, idx) => {
      message += `${idx + 1}. ${i.name} (${i.weight}) x${i.qty} = ₹${i.price * i.qty}\n`;
    });
    message += `\nTotal Amount: ₹${store.getCartTotal()}\n`;
  } else {
    message += `Items: Premium Mirchi Powder (250g) x1\n`;
  }
  message += `\nPlease confirm available delivery to my pincode.`;

  previewText.textContent = message;

  const sendBtn = document.getElementById('send-whatsapp-btn');
  if (sendBtn) {
    sendBtn.onclick = () => {
      const encoded = encodeURIComponent(message);
      window.open(`https://wa.me/919876543210?text=${encoded}`, '_blank');
      modal.classList.remove('active');
    };
  }

  modal.classList.add('active');
}

// --------------------------------------------------------------------------
// Process Steps & Recipes Rendering
// --------------------------------------------------------------------------
function renderProcessSteps() {
  const container = document.getElementById('process-timeline-container');
  if (!container) return;

  container.innerHTML = PROCESS_STEPS.map(s => `
    <div class="process-step-card">
      <span class="step-num">${s.step}</span>
      <div class="step-icon-wrapper">
        <i class="${s.icon}"></i>
      </div>
      <h4 class="step-title">${s.title}</h4>
      <p class="step-desc">${s.desc}</p>
    </div>
  `).join('');
}

function renderRecipes() {
  const container = document.getElementById('recipes-container');
  if (!container) return;

  container.innerHTML = RECIPES_DATA.map(r => `
    <div class="recipe-card">
      <div class="recipe-img-wrapper">
        <img src="${r.image}" alt="${r.title}" loading="lazy" />
        <span class="recipe-time-badge"><i class="fa-solid fa-clock"></i> ${r.prepTime}</span>
      </div>
      <div class="recipe-body">
        <span class="recipe-category">${r.category}</span>
        <h3 class="recipe-title">${r.title}</h3>
        <p class="recipe-desc">${r.desc}</p>

        <div class="recipe-card-footer">
          <button class="btn btn-secondary" style="padding: 0.45rem 0.9rem; font-size: 0.82rem;"
            onclick="openRecipeDetailModal('${r.id}')">
            View Recipe
          </button>
          <button class="btn btn-primary" style="padding: 0.45rem 0.9rem; font-size: 0.82rem;"
            onclick="handleAddToCart('${r.recommendedProductId}', 1)">
            <i class="fa-solid fa-plus"></i> Buy Mirchi
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

window.openRecipeDetailModal = function(recipeId) {
  const recipe = RECIPES_DATA.find(r => r.id === recipeId);
  if (!recipe) return;

  const modal = document.getElementById('recipe-detail-modal');
  const container = document.getElementById('recipe-modal-container');
  if (!modal || !container) return;

  container.innerHTML = `
    <h2 style="font-family: var(--ff-heading); color: var(--clr-deep-red); margin-bottom: 0.5rem;">${recipe.title}</h2>
    <div style="display: flex; gap: 1rem; font-size: 0.88rem; color: var(--clr-text-muted); margin-bottom: 1.2rem;">
      <span>Category: ${recipe.category}</span> | <span>Prep Time: ${recipe.prepTime}</span>
    </div>
    
    <div style="height: 240px; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 1.5rem;">
      <img src="${recipe.image}" alt="${recipe.title}" style="width:100%; height:100%; object-fit:cover;" />
    </div>

    <div style="margin-bottom: 1.5rem;">
      <h4 style="color: var(--clr-heading-dark); margin-bottom: 0.6rem;">Key Ingredients:</h4>
      <ul style="list-style: disc; padding-left: 1.2rem; font-size: 0.92rem;">
        ${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}
      </ul>
    </div>

    <div style="margin-bottom: 1.8rem;">
      <h4 style="color: var(--clr-heading-dark); margin-bottom: 0.6rem;">Preparation Method:</h4>
      <ol style="padding-left: 1.2rem; font-size: 0.92rem; display: flex; flex-direction: column; gap: 0.5rem;">
        ${recipe.steps.map(s => `<li>${s}</li>`).join('')}
      </ol>
    </div>

    <div style="background: linear-gradient(135deg, #FFF6E8, #FFEDD5); border: 1px solid var(--clr-gold); border-radius: var(--radius-md); padding: 1.2rem; display: flex; align-items: center; justify-content: space-between;">
      <div>
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--clr-amber-spice); text-transform: uppercase;">Recommended Chilli Powder:</div>
        <strong style="color: var(--clr-deep-red); font-size: 1rem;">${recipe.recommendedProductName}</strong>
      </div>
      <button class="btn btn-primary" onclick="handleAddToCart('${recipe.recommendedProductId}', 1); document.getElementById('recipe-detail-modal').classList.remove('active');">
        Add Pack to Cart
      </button>
    </div>
  `;

  modal.classList.add('active');
};

function renderReviews() {
  const container = document.getElementById('reviews-container');
  if (!container) return;

  container.innerHTML = REVIEWS_DATA.map(rev => `
    <div class="review-card">
      <div class="review-header">
        <div class="avatar">${rev.name.charAt(0)}</div>
        <div class="review-meta">
          <h4>${rev.name} (${rev.location})</h4>
          <div class="review-stars">
            ${'<i class="fa-solid fa-star"></i>'.repeat(rev.rating)}
          </div>
        </div>
      </div>
      <p class="review-text">"${rev.text}"</p>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; font-size: 0.8rem; color: var(--clr-text-muted);">
        <span class="verified-tag"><i class="fa-solid fa-circle-check"></i> Verified Customer</span>
        <span>${rev.date}</span>
      </div>
    </div>
  `).join('');
}

// --------------------------------------------------------------------------
// Toast Helper
// --------------------------------------------------------------------------
function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let icon = 'fa-solid fa-circle-info';
  if (type === 'success') icon = 'fa-solid fa-circle-check';
  if (type === 'error') icon = 'fa-solid fa-circle-exclamation';

  toast.innerHTML = `<i class="${icon}" style="font-size: 1.2rem;"></i> <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3200);
}
