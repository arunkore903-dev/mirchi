/* ==========================================================================
   MIRCHI PURE - PRODUCTION ADMIN DASHBOARD CONTROLLER
   KPI Computations, Chart Rendering, Order Status Manager, Inventory Controls
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  window.renderAdminDashboard = renderAdminDashboard;
});

function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderAdminDashboard() {
  renderAdminKPIs();
  renderSalesChart();
  renderAdminOrdersTable();
  renderAdminProductsTable();
  renderAdminCouponsTable();
  setupAdminTabs();
}

// --------------------------------------------------------------------------
// Compute & Display KPI Cards
// --------------------------------------------------------------------------
function renderAdminKPIs() {
  const orders = store.orders || [];
  const products = store.getProducts() || [];

  const totalSales = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length;
  const completedOrdersCount = orders.filter(o => o.orderStatus === 'Delivered').length;
  
  let lowStockCount = 0;
  products.forEach(p => {
    p.variants.forEach(v => {
      if (Number(v.stock) < 30) lowStockCount++;
    });
  });

  const salesEl = document.getElementById('admin-kpi-sales');
  const totalOrdersEl = document.getElementById('admin-kpi-orders');
  const pendingEl = document.getElementById('admin-kpi-pending');
  const completedEl = document.getElementById('admin-kpi-completed');
  const stockEl = document.getElementById('admin-kpi-stock');

  if (salesEl) salesEl.textContent = `₹${totalSales.toLocaleString('en-IN')}`;
  if (totalOrdersEl) totalOrdersEl.textContent = orders.length;
  if (pendingEl) pendingEl.textContent = pendingOrdersCount;
  if (completedEl) completedEl.textContent = completedOrdersCount;
  if (stockEl) stockEl.textContent = lowStockCount;
}

// --------------------------------------------------------------------------
// Sales Analytics Chart Renderer (Chart.js)
// --------------------------------------------------------------------------
let salesChartInstance = null;

function renderSalesChart() {
  const ctx = document.getElementById('admin-sales-chart');
  if (!ctx || !window.Chart) return;

  if (salesChartInstance) {
    salesChartInstance.destroy();
  }

  salesChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['21 Aug', '22 Aug', '23 Aug', '24 Aug', '25 Aug', '26 Aug', '27 Aug (Today)'],
      datasets: [
        {
          label: 'Sales Revenue (₹)',
          data: [2400, 3100, 4800, 3900, 5600, 7200, 8950],
          borderColor: '#D32F2F',
          backgroundColor: 'rgba(211, 47, 47, 0.08)',
          fill: true,
          tension: 0.3,
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: '#7A0914'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'top' }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#F3F4F6' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

// --------------------------------------------------------------------------
// Order Management Table
// --------------------------------------------------------------------------
function renderAdminOrdersTable() {
  const tableBody = document.getElementById('admin-orders-tbody');
  if (!tableBody) return;

  const orders = store.orders || [];

  if (orders.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No customer orders placed yet.</td></tr>`;
    return;
  }

  tableBody.innerHTML = orders.map(order => `
    <tr>
      <td><strong>${escapeHTML(order.orderId)}</strong></td>
      <td>
        <div><strong>${escapeHTML(order.customerName)}</strong></div>
        <div style="font-size: 0.78rem; color: #6B7280;">${escapeHTML(order.phone)}</div>
      </td>
      <td><strong>₹${order.totalAmount}</strong> <div style="font-size: 0.75rem; color: #6B7280;">${escapeHTML(order.paymentMode)}</div></td>
      <td>
        <span class="status-badge ${order.orderStatus.toLowerCase()}">${escapeHTML(order.orderStatus)}</span>
      </td>
      <td>
        <select class="status-select" onchange="handleAdminStatusChange('${order.orderId}', this.value)">
          <option value="Pending" ${order.orderStatus === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Processing" ${order.orderStatus === 'Processing' ? 'selected' : ''}>Processing</option>
          <option value="Shipped" ${order.orderStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
          <option value="Delivered" ${order.orderStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
        </select>
      </td>
    </tr>
  `).join('');
}

window.handleAdminStatusChange = function(orderId, newStatus) {
  store.updateOrderStatus(orderId, newStatus);
  renderAdminKPIs();
  renderAdminOrdersTable();
  if (window.showToast) showToast(`Order ${orderId} status updated to ${newStatus}`, 'success');
};

// --------------------------------------------------------------------------
// Product Management Table
// --------------------------------------------------------------------------
function renderAdminProductsTable() {
  const tableBody = document.getElementById('admin-products-tbody');
  if (!tableBody) return;

  const products = store.getProducts() || [];

  tableBody.innerHTML = products.map(product => {
    const mainVar = product.variants[product.defaultVariantIndex || 0];
    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 0.8rem;">
            <img src="${product.image}" alt="${escapeHTML(product.name)}" style="width: 36px; height: 36px; border-radius: 6px; object-fit: cover;" onerror="this.src='assets/images/hero_chilli_pack.jpg'" />
            <div>
              <strong>${escapeHTML(product.name)}</strong>
            </div>
          </div>
        </td>
        <td><strong>₹${mainVar.price}</strong> (${escapeHTML(mainVar.weight)})</td>
        <td>
          <span style="font-weight: 700; color: ${mainVar.stock < 30 ? '#EF4444' : '#10B981'};">
            ${mainVar.stock} units
          </span>
        </td>
        <td>
          <button class="btn btn-secondary btn-admin-sm" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="editProductPricePrompt('${product.id}')">
            Edit
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.editProductPricePrompt = function(productId) {
  const product = store.getProductById(productId);
  if (!product) return;

  const newPrice = prompt(`Enter new base price for ${product.name} (${product.variants[0].weight}):`, product.variants[0].price);
  if (newPrice && !isNaN(newPrice)) {
    product.variants[0].price = parseFloat(newPrice);
    store.updateProduct(product);
    renderAdminProductsTable();
    renderAdminKPIs();
    if (window.showToast) showToast(`Updated price for ${product.name}`, 'success');
  }
};

// --------------------------------------------------------------------------
// Coupons Table
// --------------------------------------------------------------------------
function renderAdminCouponsTable() {
  const tableBody = document.getElementById('admin-coupons-tbody');
  if (!tableBody) return;

  const coupons = store.coupons || [];

  tableBody.innerHTML = coupons.map(c => `
    <tr>
      <td><strong style="color: var(--clr-chilli-red); font-family: monospace;">${escapeHTML(c.code)}</strong></td>
      <td>${escapeHTML(c.desc)}</td>
      <td>${c.discountPercent ? `${c.discountPercent}% OFF` : 'Free Delivery'}</td>
      <td>₹${c.minSpend || 0}</td>
      <td><span class="status-badge delivered">Active</span></td>
    </tr>
  `).join('');
}

// --------------------------------------------------------------------------
// Admin Tabs Switcher
// --------------------------------------------------------------------------
function setupAdminTabs() {
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  const panels = document.querySelectorAll('.admin-section-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-admin-target');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });
}
