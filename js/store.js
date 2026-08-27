/* ==========================================================================
   MIRCHI PURE - STATE STORE MANAGEMENT
   LocalStorage persistence, Cart logic, Wishlist, Order generation
   ========================================================================== */

class MirchiStore {
  constructor() {
    this.initStore();
  }

  initStore() {
    // Products state
    const savedProducts = localStorage.getItem('mp_products');
    this.products = savedProducts ? JSON.parse(savedProducts) : INITIAL_PRODUCTS;

    // Cart state: [{ productId, variantIndex, weight, price, originalPrice, qty }]
    const savedCart = localStorage.getItem('mp_cart');
    this.cart = savedCart ? JSON.parse(savedCart) : [];

    // Wishlist state: array of productIds
    const savedWishlist = localStorage.getItem('mp_wishlist');
    this.wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];

    // Orders state
    const savedOrders = localStorage.getItem('mp_orders');
    this.orders = savedOrders ? JSON.parse(savedOrders) : INITIAL_ORDERS;

    // Coupons state
    const savedCoupons = localStorage.getItem('mp_coupons');
    this.coupons = savedCoupons ? JSON.parse(savedCoupons) : INITIAL_COUPONS;

    // Active applied coupon
    this.appliedCoupon = null;

    // Active View Mode: 'store' or 'admin'
    this.viewMode = localStorage.getItem('mp_view_mode') || 'store';

    this.saveState();
  }

  saveState() {
    localStorage.setItem('mp_products', JSON.stringify(this.products));
    localStorage.setItem('mp_cart', JSON.stringify(this.cart));
    localStorage.setItem('mp_wishlist', JSON.stringify(this.wishlist));
    localStorage.setItem('mp_orders', JSON.stringify(this.orders));
    localStorage.setItem('mp_coupons', JSON.stringify(this.coupons));
    localStorage.setItem('mp_view_mode', this.viewMode);
  }

  // --- Product Helpers ---
  getProducts() {
    return this.products;
  }

  getProductById(id) {
    return this.products.find(p => p.id === id);
  }

  updateProduct(updatedProd) {
    const idx = this.products.findIndex(p => p.id === updatedProd.id);
    if (idx !== -1) {
      this.products[idx] = updatedProd;
      this.saveState();
      window.dispatchEvent(new CustomEvent('mp:products-changed'));
    }
  }

  addProduct(newProd) {
    this.products.unshift(newProd);
    this.saveState();
    window.dispatchEvent(new CustomEvent('mp:products-changed'));
  }

  // --- Cart Management ---
  addToCart(productId, variantIndex = null, qty = 1) {
    const product = this.getProductById(productId);
    if (!product) return;

    const vIdx = variantIndex !== null ? variantIndex : product.defaultVariantIndex;
    const variant = product.variants[vIdx];

    // Check if item already exists in cart with same product and weight variant
    const existingIndex = this.cart.findIndex(
      item => item.productId === productId && item.weight === variant.weight
    );

    if (existingIndex > -1) {
      this.cart[existingIndex].qty += qty;
    } else {
      this.cart.push({
        productId: product.id,
        name: product.name,
        category: product.category,
        image: product.image,
        variantIndex: vIdx,
        weight: variant.weight,
        price: variant.price,
        originalPrice: variant.originalPrice,
        qty: qty
      });
    }

    this.saveState();
    window.dispatchEvent(new CustomEvent('mp:cart-changed'));
  }

  removeFromCart(index) {
    if (index >= 0 && index < this.cart.length) {
      this.cart.splice(index, 1);
      this.saveState();
      window.dispatchEvent(new CustomEvent('mp:cart-changed'));
    }
  }

  updateCartQty(index, newQty) {
    if (index >= 0 && index < this.cart.length) {
      if (newQty <= 0) {
        this.removeFromCart(index);
      } else {
        this.cart[index].qty = newQty;
        this.saveState();
        window.dispatchEvent(new CustomEvent('mp:cart-changed'));
      }
    }
  }

  clearCart() {
    this.cart = [];
    this.appliedCoupon = null;
    this.saveState();
    window.dispatchEvent(new CustomEvent('mp:cart-changed'));
  }

  getCartSubtotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  }

  getDiscountAmount() {
    const subtotal = this.getCartSubtotal();
    if (!this.appliedCoupon) return 0;
    
    if (this.appliedCoupon.discountPercent) {
      return Math.round((subtotal * this.appliedCoupon.discountPercent) / 100);
    }
    return 0;
  }

  getShippingFee() {
    const subtotal = this.getCartSubtotal();
    if (subtotal === 0) return 0;
    if (subtotal >= 499 || (this.appliedCoupon && this.appliedCoupon.freeShipping)) {
      return 0; // Free delivery above 499 or with coupon
    }
    return 40; // Flat ₹40 delivery
  }

  getCartTotal() {
    const subtotal = this.getCartSubtotal();
    const discount = this.getDiscountAmount();
    const shipping = this.getShippingFee();
    return Math.max(0, subtotal - discount + shipping);
  }

  applyCoupon(code) {
    const cleanCode = code.trim().toUpperCase();
    const coupon = this.coupons.find(c => c.code === cleanCode);
    const subtotal = this.getCartSubtotal();

    if (!coupon) {
      return { success: false, message: "Invalid coupon code." };
    }

    if (coupon.minSpend && subtotal < coupon.minSpend) {
      return { success: false, message: `Minimum spend of ₹${coupon.minSpend} required for code ${cleanCode}.` };
    }

    this.appliedCoupon = coupon;
    window.dispatchEvent(new CustomEvent('mp:cart-changed'));
    return { success: true, message: `Coupon ${cleanCode} applied successfully!` };
  }

  // --- Wishlist Management ---
  toggleWishlist(productId) {
    const idx = this.wishlist.indexOf(productId);
    if (idx > -1) {
      this.wishlist.splice(idx, 1);
    } else {
      this.wishlist.push(productId);
    }
    this.saveState();
    window.dispatchEvent(new CustomEvent('mp:wishlist-changed'));
  }

  isWishlisted(productId) {
    return this.wishlist.includes(productId);
  }

  // --- Order Generation & Tracking ---
  createOrder(customerDetails) {
    const orderNum = Math.floor(10000 + Math.random() * 90000);
    const orderId = `MRC-${orderNum}`;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) + `, ` + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const newOrder = {
      orderId: orderId,
      customerName: customerDetails.name,
      phone: customerDetails.phone,
      email: customerDetails.email || 'N/A',
      address: `${customerDetails.address}, ${customerDetails.city} - ${customerDetails.pincode}`,
      items: this.cart.map(item => ({
        productId: item.productId,
        name: `${item.name} (${item.weight})`,
        qty: item.qty,
        price: item.price
      })),
      totalAmount: this.getCartTotal(),
      subtotal: this.getCartSubtotal(),
      discount: this.getDiscountAmount(),
      shippingFee: this.getShippingFee(),
      paymentMode: customerDetails.paymentMode,
      paymentStatus: customerDetails.paymentMode === 'COD' ? 'Pending COD' : 'Paid Online (Verified)',
      orderStatus: 'Pending',
      date: formattedDate,
      trackingSteps: [
        { step: "Order Placed", done: true, time: formattedDate },
        { step: "Fresh Batch Preparation", done: false, time: "Scheduled within 2 hrs" },
        { step: "Aroma-Lock Packing", done: false, time: "Pending" },
        { step: "Handed to Express Courier", done: false, time: "Pending" },
        { step: "Doorstep Delivery", done: false, time: "Expected in 2-3 Days" }
      ]
    };

    this.orders.unshift(newOrder);
    this.clearCart();
    this.saveState();
    window.dispatchEvent(new CustomEvent('mp:orders-changed'));
    return newOrder;
  }

  findOrder(query) {
    const q = query.trim().toLowerCase();
    return this.orders.find(
      o => o.orderId.toLowerCase() === q || o.phone.toLowerCase().includes(q)
    );
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.orders.find(o => o.orderId === orderId);
    if (order) {
      order.orderStatus = newStatus;
      
      // Update tracking steps logically based on status
      if (newStatus === 'Processing') {
        order.trackingSteps[1].done = true;
        order.trackingSteps[1].time = "In Progress";
      } else if (newStatus === 'Shipped') {
        order.trackingSteps[1].done = true;
        order.trackingSteps[2].done = true;
        order.trackingSteps[3].done = true;
        order.trackingSteps[3].time = "Dispatched";
      } else if (newStatus === 'Delivered') {
        order.trackingSteps.forEach(s => s.done = true);
        if (order.paymentMode === 'Cash on Delivery') {
          order.paymentStatus = 'Paid (COD Collected)';
        }
      }

      this.saveState();
      window.dispatchEvent(new CustomEvent('mp:orders-changed'));
    }
  }
}

// Global Singleton Instance
const store = new MirchiStore();
