/* ==========================================================================
   MIRCHI PURE - PRODUCTION STOREFRONT APPLICATION
   Modular UI Controller, Input Validation, Service Worker, Accessibility
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  registerServiceWorker();
  renderProducts();
  renderProcessSteps();
  renderRecipes();
  renderReviews();
  updateCartUI();
  updateWishlistUI();
  setupEventListeners();
  setupAccessibilityListeners();
}

// --------------------------------------------------------------------------
// Service Worker Registration for Production PWA
// --------------------------------------------------------------------------
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => console.log('Mirchi Pure SW registered cleanly:', reg.scope))
        .catch((err) => console.warn('SW registration skipped:', err));
    });
  }
}

// --------------------------------------------------------------------------
// Input Validation Helpers
// --------------------------------------------------------------------------
function validatePhone(phone) {
  const clean = phone.replace(/[\s\-\+\(\)]/g, '');
  return /^(?:0|\+?91)?([6-9]\d{9})$/.test(clean);
}

function validatePincode(pincode) {
  return /^\d{6}$/.test(pincode.trim());
}

function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// --------------------------------------------------------------------------
// Event Listeners & Keyboard Accessibility
// --------------------------------------------------------------------------
function setupEventListeners() {
  window.addEventListener('mp:cart-changed', () => updateCartUI());
  window.addEventListener('mp:wishlist-changed', () => {
    updateWishlistUI();
    renderProducts();
  });
  window.addEventListener('mp:products-changed', () => renderProducts());

  // Category Filter Pills
  const filterPills = document.querySelectorAll('.filter-pill');
  filterPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      filterPills.forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
      const category = e.target.getAttribute('data-category');
      renderProducts(category);
    });
  });

  // Search input with debounce
  const searchInput = document.getElementById('catalog-search');
  if (searchInput) {
    let timeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        renderProducts('All', e.target.value.toLowerCase().trim());
      }, 200);
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

  // Checkout Trigger
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

  // Form Submissions
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleOrderSubmit();
    });
  }

  const trackBtns = document.querySelectorAll('[data-action="open-tracker"]');
  trackBtns.forEach(btn => btn.addEventListener('click', openTrackerModal));

  const trackForm = document.getElementById('tracking-form');
  if (trackForm) {
    trackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleTrackingSearch();
    });
  }

  const whatsappBtns = document.querySelectorAll('[data-action="open-whatsapp-order"]');
  whatsappBtns.forEach(btn => btn.addEventListener('click', openWhatsAppModal));

  const modeSwitchBtns = document.querySelectorAll('[data-action="toggle-admin-mode"]');
  modeSwitchBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const newMode = store.viewMode === 'store' ? 'admin' : 'store';
      store.viewMode = newMode;
      store.saveState();
      toggleViewModeUI();
    });
  });

  const modalCloseBtns = document.querySelectorAll('.modal-close-btn, [data-action="close-modal"]');
  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-wrapper');
      if (modal) modal.classList.remove('active');
    });
  });

  const modals = document.querySelectorAll('.modal-wrapper');
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  });

  toggleViewModeUI();
}

function setupAccessibilityListeners() {
  // Keydown Escape closes open modals & drawers
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCartDrawer();
      document.querySelectorAll('.modal-wrapper.active').forEach(m => m.classList.remove('active'));
    }
  });
}

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
// Product Catalog Rendering
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
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem;">
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
          <span class="badge badge-gold">${escapeHTML(product.badge || 'Fresh Batch')}</span>
          <button class="wishlist-btn ${isWish ? 'active' : ''}" onclick="toggleWishlistHandler('${product.id}')" aria-label="Toggle Wishlist">
            <i class="${isWish ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}"></i>
          </button>
        </div>

        <div class="product-img-box" onclick="openProductDetailModal('${product.id}')">
          <img src="${product.image}" alt="${escapeHTML(product.name)}" loading="lazy" decoding="async" onerror="this.src='assets/images/hero_chilli_pack.jpg'" />
        </div>

        <div class="product-content">
          <div class="spice-level-indicator">
            ${flamesHtml}
            <span>${escapeHTML(product.spiceText)}</span>
          </div>

          <h3 class="product-title" onclick="openProductDetailModal('${product.id}')">${escapeHTML(product.name)}</h3>
          <p class="product-short-desc">${escapeHTML(product.description)}</p>

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
            <button class="btn btn-secondary" style="padding: 0.6rem 0.6rem; font-size: 0.82rem;"
              onclick="handleAddToCart('${product.id}', ${activeVarIdx})">
              <i class="fa-solid fa-basket-shopping"></i> Add to Cart
            </button>
            <button class="btn btn-primary" style="padding: 0.6rem 0.6rem; font-size: 0.82rem;"
              onclick="handleBuyNow('${product.id}', ${activeVarIdx})">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

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
        <div style="border-radius: var(--radius-lg); overflow: hidden; height: 260px; box-shadow: var(--shadow-md);">
          <img src="${product.image}" alt="${escapeHTML(product.name)}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/images/hero_chilli_pack.jpg'" />
        </div>

        <div>
          <span class="badge badge-red" style="margin-bottom: 0.6rem;">${escapeHTML(product.category)}</span>
          <h2 style="font-family: var(--ff-heading); margin-bottom: 0.4rem; color: var(--clr-deep-red);">${escapeHTML(product.name)}</h2>
          
          <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.8rem;">
            <div style="color: #FFC107; font-size: 0.85rem;">
              <i class="fa-solid fa-star"></i> ${product.rating} (${product.reviewsCount} Reviews)
            </div>
            <span class="badge badge-green">${escapeHTML(product.spiceText)}</span>
          </div>

          <p style="color: var(--clr-text-body); margin-bottom: 1.2rem; font-size: 0.88rem;">${escapeHTML(product.description)}</p>

          <div style="margin-bottom: 1rem;">
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

          <div class="price-row" style="margin-bottom: 1.4rem;">
            <span class="current-price" style="font-size: 1.6rem;">₹${variant.price}</span>
            ${variant.originalPrice ? `<span class="original-price" style="font-size: 1rem;">₹${variant.originalPrice}</span>` : ''}
          </div>

          <div style="display: flex; gap: 0.8rem; margin-bottom: 1.5rem;">
            <button class="btn btn-primary" style="flex: 1; font-size: 0.88rem;" id="modal-add-cart-btn">
              <i class="fa-solid fa-basket-shopping"></i> Add to Cart
            </button>
            <button class="btn btn-gold" style="flex: 1; font-size: 0.88rem;" id="modal-buy-now-btn">
              Buy Now
            </button>
          </div>

          <div style="background: var(--clr-cream-bg); padding: 0.8rem; border-radius: var(--radius-md); font-size: 0.8rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem;">
            <div><i class="fa-solid fa-circle-check text-green"></i> 100% Quality</div>
            <div><i class="fa-solid fa-circle-check text-green"></i> Hygienic Mill</div>
            <div><i class="fa-solid fa-circle-check text-green"></i> Freshly Packed</div>
            <div><i class="fa-solid fa-circle-check text-green"></i> Authentic Taste</div>
          </div>
        </div>
      </div>

      <div class="detail-tabs">
        <button class="tab-btn active" data-tab="tab-love">Why You'll Love It</button>
        <button class="tab-btn" data-tab="tab-prep">Preparation & Ingredients</button>
        <button class="tab-btn" data-tab="tab-storage">Packaging & Shelf Life</button>
      </div>

      <div class="tab-content-panel active" id="tab-love">
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem;">
          ${product.whyYouLoveIt.map(item => `
            <li style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem;">
              <i class="fa-solid fa-pepper-hot text-red"></i> <span>${escapeHTML(item)}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="tab-content-panel" id="tab-prep">
        <p><strong>Ingredients:</strong> ${escapeHTML(product.ingredients)}</p>
        <p style="margin-top: 0.4rem;"><strong>Preparation:</strong> ${escapeHTML(product.prepProcess)}</p>
      </div>

      <div class="tab-content-panel" id="tab-storage">
        <p><strong>Packaging:</strong> ${escapeHTML(product.packaging)}</p>
        <p style="margin-top: 0.4rem;"><strong>Storage:</strong> ${escapeHTML(product.storage)}</p>
        <p style="margin-top: 0.4rem;"><strong>Shelf Life:</strong> ${escapeHTML(product.shelfLife)}</p>
      </div>
    `;

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

  const threshold = 499;
  if (subtotal >= threshold || (store.appliedCoupon && store.appliedCoupon.freeShipping)) {
    if (freeShipBar) freeShipBar.style.width = '100%';
    if (freeShipText) freeShipText.innerHTML = `🎉 You unlocked <strong>FREE Delivery!</strong>`;
  } else {
    const diff = threshold - subtotal;
    const pct = Math.min(100, Math.round((subtotal / threshold) * 100));
    if (freeShipBar) freeShipBar.style.width = `${pct}%`;
    if (freeShipText) freeShipText.innerHTML = `Add <strong>₹${diff}</strong> more for FREE Delivery!`;
  }

  if (store.cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2.5rem 1rem; color: var(--clr-text-muted);">
        <i class="fa-solid fa-basket-shopping" style="font-size: 3rem; margin-bottom: 0.8rem; color: var(--clr-border);"></i>
        <h4>Your Cart is Empty</h4>
        <p style="font-size: 0.85rem; margin-top: 0.3rem;">Explore our freshly prepared chilli powders and stock up your kitchen!</p>
      </div>
    `;
  } else {
    container.innerHTML = store.cart.map((item, idx) => `
      <div class="cart-item">
        <img src="${item.image}" alt="${escapeHTML(item.name)}" class="cart-item-img" onerror="this.src='assets/images/hero_chilli_pack.jpg'" />
        <div class="cart-item-details">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <span class="cart-item-title">${escapeHTML(item.name)}</span>
              <div class="cart-item-meta">Pack: ${escapeHTML(item.weight)}</div>
            </div>
            <button onclick="store.removeFromCart(${idx})" style="color: var(--clr-text-muted); font-size: 0.9rem;" aria-label="Remove item">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.4rem;">
            <div class="qty-controls">
              <button class="qty-btn" onclick="store.updateCartQty(${idx}, ${item.qty - 1})">-</button>
              <span style="font-size: 0.85rem; font-weight: 700; width: 18px; text-align: center;">${item.qty}</span>
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
// Checkout Flow with Production Validation
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
      <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.3rem;">
        <span>${escapeHTML(item.name)} (${escapeHTML(item.weight)}) x${item.qty}</span>
        <strong>₹${item.price * item.qty}</strong>
      </div>
    `).join('') + `
      <div style="border-top: 1px dashed var(--clr-border); padding-top: 0.5rem; margin-top: 0.5rem; display: flex; justify-content: space-between; font-weight: 800; color: var(--clr-deep-red); font-size: 1rem;">
        <span>Total Payable</span>
        <span>₹${store.getCartTotal()}</span>
      </div>
    `;
  }

  if (modal) modal.classList.add('active');
}

function handleOrderSubmit() {
  const name = document.getElementById('cust-name')?.value.trim() || '';
  const phone = document.getElementById('cust-phone')?.value.trim() || '';
  const emailInput = document.getElementById('cust-email');
  const email = emailInput ? emailInput.value.trim() : 'N/A';
  const address = document.getElementById('cust-address')?.value.trim() || '';
  const city = document.getElementById('cust-city')?.value.trim() || '';
  const pincode = document.getElementById('cust-pincode')?.value.trim() || '';
  const paymentModeInput = document.querySelector('input[name="payment-mode"]:checked');
  const paymentMode = paymentModeInput ? paymentModeInput.value : 'Cash on Delivery';

  if (!name || !phone || !address || !city || !pincode) {
    showToast("Please fill in all mandatory address fields.", "error");
    return;
  }

  if (!validatePhone(phone)) {
    showToast("Please enter a valid 10-digit Indian mobile number.", "error");
    return;
  }

  if (!validatePincode(pincode)) {
    showToast("Please enter a valid 6-digit Pincode.", "error");
    return;
  }

  const newOrder = store.createOrder({
    name: escapeHTML(name),
    phone: escapeHTML(phone),
    email: escapeHTML(email),
    address: escapeHTML(address),
    city: escapeHTML(city),
    pincode: escapeHTML(pincode),
    paymentMode
  });

  const checkoutModal = document.getElementById('checkout-modal');
  if (checkoutModal) checkoutModal.classList.remove('active');

  if (window.confetti) {
    window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  }

  openOrderSuccessModal(newOrder);
}

function openOrderSuccessModal(order) {
  const modal = document.getElementById('order-success-modal');
  const detailsContainer = document.getElementById('order-success-details');
  if (!modal || !detailsContainer) return;

  detailsContainer.innerHTML = `
    <div style="text-align: center; margin-bottom: 1.2rem;">
      <div style="width: 60px; height: 60px; background: #E8F5E9; color: var(--clr-dark-green); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 0.8rem;">
        <i class="fa-solid fa-circle-check"></i>
      </div>
      <h3 style="color: var(--clr-deep-red); margin-bottom: 0.2rem; font-size: 1.3rem;">Order Placed!</h3>
      <p style="font-size: 0.88rem;">Order ID: <strong style="color: var(--clr-chilli-red); font-size: 1rem;">${order.orderId}</strong></p>
    </div>

    <div style="background: var(--clr-cream-bg); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.2rem; font-size: 0.85rem;">
      <p><strong>Customer:</strong> ${escapeHTML(order.customerName)} (${escapeHTML(order.phone)})</p>
      <p style="margin-top: 0.3rem;"><strong>Address:</strong> ${escapeHTML(order.address)}</p>
      <p style="margin-top: 0.3rem;"><strong>Payment:</strong> ${escapeHTML(order.paymentMode)} (${escapeHTML(order.paymentStatus)})</p>
      <p style="margin-top: 0.3rem;"><strong>Total Paid:</strong> ₹${order.totalAmount}</p>
    </div>

    <div style="display: flex; gap: 0.8rem;">
      <button class="btn btn-primary" style="flex: 1; font-size: 0.85rem;" onclick="openTrackerModalWithId('${order.orderId}')">
        <i class="fa-solid fa-truck-fast"></i> Track Order
      </button>
      <button class="btn btn-secondary" style="flex: 1; font-size: 0.85rem;" onclick="document.getElementById('order-success-modal').classList.remove('active')">
        Continue
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
      <div style="text-align: center; padding: 1.5rem; color: var(--clr-chilli-red);">
        <i class="fa-solid fa-circle-exclamation" style="font-size: 2rem;"></i>
        <h4 style="margin-top: 0.4rem; font-size: 0.95rem;">Order Not Found</h4>
        <p style="font-size: 0.82rem; color: var(--clr-text-muted);">Please check your Order ID (e.g., MRC-84920) or Phone number.</p>
      </div>
    `;
    return;
  }

  resultBox.innerHTML = `
    <div style="background: #FFF; border: 1px solid var(--clr-border); border-radius: var(--radius-md); padding: 1rem; margin-top: 0.8rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--clr-border-light); padding-bottom: 0.6rem; margin-bottom: 0.8rem;">
        <div>
          <h4 style="color: var(--clr-deep-red); font-size: 0.95rem;">Order ID: ${order.orderId}</h4>
          <span style="font-size: 0.75rem; color: var(--clr-text-muted);">${order.date}</span>
        </div>
        <span class="badge ${order.orderStatus === 'Delivered' ? 'badge-green' : 'badge-gold'}" style="font-size: 0.7rem;">
          ${order.orderStatus}
        </span>
      </div>

      <div style="margin-bottom: 0.8rem; font-size: 0.82rem;">
        <strong>Items Ordered:</strong>
        <ul style="list-style: none; margin-top: 0.3rem; color: var(--clr-text-body);">
          ${order.items.map(i => `<li>• ${escapeHTML(i.name)} x${i.qty} - ₹${i.price * i.qty}</li>`).join('')}
        </ul>
      </div>

      <div style="position: relative; padding-left: 1.2rem; border-left: 2px solid var(--clr-border); display: flex; flex-direction: column; gap: 0.9rem;">
        ${order.trackingSteps.map(s => `
          <div style="position: relative;">
            <div style="position: absolute; left: -1.55rem; top: 0; width: 12px; height: 12px; border-radius: 50%; background: ${s.done ? 'var(--clr-chilli-red)' : 'var(--clr-border)'}; border: 2px solid #FFF;"></div>
            <div style="font-family: var(--ff-ui); font-weight: ${s.done ? '700' : '500'}; font-size: 0.82rem; color: ${s.done ? 'var(--clr-heading-dark)' : 'var(--clr-text-muted)'};">
              ${escapeHTML(s.step)}
            </div>
            <div style="font-size: 0.72rem; color: var(--clr-text-muted);">${escapeHTML(s.time)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// WhatsApp Ordering
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
      <h4 class="step-title">${escapeHTML(s.title)}</h4>
      <p class="step-desc">${escapeHTML(s.desc)}</p>
    </div>
  `).join('');
}

function renderRecipes() {
  const container = document.getElementById('recipes-container');
  if (!container) return;

  container.innerHTML = RECIPES_DATA.map(r => `
    <div class="recipe-card">
      <div class="recipe-img-wrapper">
        <img src="${r.image}" alt="${escapeHTML(r.title)}" loading="lazy" decoding="async" onerror="this.src='assets/images/chilli_curry_dish.jpg'" />
        <span class="recipe-time-badge"><i class="fa-solid fa-clock"></i> ${escapeHTML(r.prepTime)}</span>
      </div>
      <div class="recipe-body">
        <span class="recipe-category">${escapeHTML(r.category)}</span>
        <h3 class="recipe-title">${escapeHTML(r.title)}</h3>
        <p class="recipe-desc">${escapeHTML(r.desc)}</p>

        <div class="recipe-card-footer">
          <button class="btn btn-secondary" style="padding: 0.35rem 0.7rem; font-size: 0.78rem;"
            onclick="openRecipeDetailModal('${r.id}')">
            Recipe
          </button>
          <button class="btn btn-primary" style="padding: 0.35rem 0.7rem; font-size: 0.78rem;"
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
    <h3 style="font-family: var(--ff-heading); color: var(--clr-deep-red); margin-bottom: 0.3rem;">${escapeHTML(recipe.title)}</h3>
    <div style="font-size: 0.8rem; color: var(--clr-text-muted); margin-bottom: 1rem;">
      <span>Category: ${escapeHTML(recipe.category)}</span> | <span>Prep Time: ${escapeHTML(recipe.prepTime)}</span>
    </div>
    
    <div style="height: 180px; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 1rem;">
      <img src="${recipe.image}" alt="${escapeHTML(recipe.title)}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/images/chilli_curry_dish.jpg'" />
    </div>

    <div style="margin-bottom: 1rem;">
      <h4 style="color: var(--clr-heading-dark); margin-bottom: 0.4rem; font-size: 0.9rem;">Key Ingredients:</h4>
      <ul style="list-style: disc; padding-left: 1rem; font-size: 0.85rem;">
        ${recipe.ingredients.map(i => `<li>${escapeHTML(i)}</li>`).join('')}
      </ul>
    </div>

    <div style="margin-bottom: 1.2rem;">
      <h4 style="color: var(--clr-heading-dark); margin-bottom: 0.4rem; font-size: 0.9rem;">Preparation Method:</h4>
      <ol style="padding-left: 1rem; font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.4rem;">
        ${recipe.steps.map(s => `<li>${escapeHTML(s)}</li>`).join('')}
      </ol>
    </div>

    <div style="background: linear-gradient(135deg, #FFF6E8, #FFEDD5); border: 1px solid var(--clr-gold); border-radius: var(--radius-md); padding: 0.8rem; display: flex; align-items: center; justify-content: space-between;">
      <div>
        <div style="font-size: 0.72rem; font-weight: 700; color: var(--clr-amber-spice); text-transform: uppercase;">Recommended Pack:</div>
        <strong style="color: var(--clr-deep-red); font-size: 0.88rem;">${escapeHTML(recipe.recommendedProductName)}</strong>
      </div>
      <button class="btn btn-primary" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;" onclick="handleAddToCart('${recipe.recommendedProductId}', 1); document.getElementById('recipe-detail-modal').classList.remove('active');">
        Add Pack
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
        <div class="avatar">${escapeHTML(rev.name.charAt(0))}</div>
        <div class="review-meta">
          <h4>${escapeHTML(rev.name)} (${escapeHTML(rev.location)})</h4>
          <div class="review-stars">
            ${'<i class="fa-solid fa-star"></i>'.repeat(rev.rating)}
          </div>
        </div>
      </div>
      <p class="review-text">"${escapeHTML(rev.text)}"</p>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; font-size: 0.75rem; color: var(--clr-text-muted);">
        <span class="verified-tag"><i class="fa-solid fa-circle-check"></i> Verified Customer</span>
        <span>${escapeHTML(rev.date)}</span>
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

  toast.innerHTML = `<i class="${icon}" style="font-size: 1.1rem;"></i> <span>${escapeHTML(message)}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
