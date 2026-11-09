/**
 * Achar & Co. — Core Application Scripts
 * Shared across all pages: Navigation, Cart Drawer, WhatsApp Links, Modals, Toasts
 * Synchronized with Supabase / Admin Product Management
 */

// Cart state (stored in localStorage)
let ACHAR_CART = JSON.parse(localStorage.getItem("achar_co_cart") || "[]");

document.addEventListener("DOMContentLoaded", () => {
  // Sync latest product database before rendering
  syncProductsFromStorage();

  initNavigation();
  initFloatingWhatsApp();
  initCartDrawer();
  updateCartBadge();
  setupGlobalPlaceholders();

  // Listen for storage events (when admin updates in another tab)
  window.addEventListener("storage", (e) => {
    if (e.key === "achar_admin_products") {
      syncProductsFromStorage();
      window.dispatchEvent(new CustomEvent("achar:products-updated"));
    }
  });
});

/**
 * Synchronize live products from Admin Product Management (Supabase / local store)
 */
function syncProductsFromStorage() {
  try {
    const raw = localStorage.getItem("achar_admin_products");
    if (!raw || typeof ACHAR_CONFIG === "undefined") return;
    const adminProducts = JSON.parse(raw);
    if (!Array.isArray(adminProducts) || adminProducts.length === 0) return;

    // Filter active products only (exclude Draft and Inactive)
    const activeAdminProducts = adminProducts.filter(p => (p.product_status || 'Active') === 'Active');

    // Create lookup of default config products by id or slug
    const existingMap = new Map();
    ACHAR_CONFIG.products.forEach(p => {
      existingMap.set(p.id, p);
      if (p.slug) existingMap.set(p.slug, p);
    });

    const syncedList = activeAdminProducts.map(p => {
      const match = existingMap.get(p.id) || existingMap.get(p.slug) || {};
      const regPrice = Number(p.regular_price) || match.prices?.["250g"] || 190;
      const discountPrice = p.discount_price ? Number(p.discount_price) : null;
      const activeBasePrice = discountPrice || regPrice;

      const prices = {
        "250g": activeBasePrice,
        "500g": Math.round(activeBasePrice * 1.9),
        "1kg": Math.round(activeBasePrice * 3.6)
      };

      const primaryImg = p.primary_image || (p.images && p.images[0]?.image_url) || match.image || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800';

      return {
        id: p.id,
        slug: p.slug || match.slug || p.id,
        name: p.name || match.name,
        malayalamName: match.malayalamName || p.name,
        category: p.category_name || match.category || 'Vegetarian',
        badge: p.is_featured ? 'FEATURED' : (match.badge || 'HERITAGE SELECTION'),
        shortDesc: p.short_description || match.shortDesc || '',
        fullStory: p.description || match.fullStory || p.short_description || '',
        image: primaryImg,
        images: p.images && p.images.length > 0 ? p.images : (match.images || [{ image_url: primaryImg, is_primary: true }]),
        prices,
        regular_price: regPrice,
        discount_price: discountPrice,
        availability_status: p.availability_status || 'In Stock',
        is_out_of_stock: p.availability_status === 'Out of Stock',
        is_featured: Boolean(p.is_featured),
        ingredients: p.ingredients || match.ingredients || '',
        allergens: p.allergen_information || match.allergens || 'Contains Sesame and Mustard seeds.',
        storage: p.storage_instructions || match.storage || 'Store in a cool, dry place. Keep sealed.',
        shelfLife: p.shelf_life || match.shelfLife || '9 months from packaging date.'
      };
    });

    if (syncedList.length > 0) {
      ACHAR_CONFIG.products = syncedList;
    }
  } catch (err) {
    console.warn("Could not sync products from storage:", err);
  }
}

/**
 * Navigation & Header handling
 */
function initNavigation() {
  const header = document.querySelector(".site-header");
  const mobileToggle = document.querySelector(".mobile-toggle");
  const nav = document.querySelector(".main-navigation");

  // Sticky header class
  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      header?.classList.add("scrolled");
    } else {
      header?.classList.remove("scrolled");
    }
  });

  // Mobile menu toggle
  if (mobileToggle && nav) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      mobileToggle.setAttribute("aria-expanded", String(isOpen));
      mobileToggle.innerHTML = isOpen ? "&times;" : "&#9776;";
    });

    // Close when clicking outside or on a link
    document.addEventListener("click", (e) => {
      if (!nav.contains(e.target) && !mobileToggle.contains(e.target)) {
        nav.classList.remove("open");
        mobileToggle.setAttribute("aria-expanded", "false");
        mobileToggle.innerHTML = "&#9776;";
      }
    });
  }

  // Highlight active link based on current pathname
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPath || (currentPath === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });
}

/**
 * Floating WhatsApp Button setup
 */
function initFloatingWhatsApp() {
  const floatingBtn = document.getElementById("floatingWhatsApp");
  if (floatingBtn && typeof ACHAR_CONFIG !== "undefined") {
    const defaultMsg = `Namaskaram Achar & Co.! 🌶️ I am visiting your website and would like to enquire about ordering traditional Kerala pickles.`;
    floatingBtn.href = ACHAR_CONFIG.getWhatsAppUrl(defaultMsg);
  }

  // Any header WA button
  const headerWa = document.querySelector(".header-wa-btn");
  if (headerWa && typeof ACHAR_CONFIG !== "undefined") {
    const headerMsg = `Namaskaram Achar & Co.! I would like to place an order for Kerala pickles.`;
    headerWa.href = ACHAR_CONFIG.getWhatsAppUrl(headerMsg);
  }
}

/**
 * Global Cart Drawer Management
 */
function initCartDrawer() {
  const openBtn = document.getElementById("openBagBtn");
  const closeBtn = document.getElementById("closeBagBtn");
  const backdrop = document.getElementById("cartBackdrop");
  const drawer = document.getElementById("cartDrawer");
  const checkoutBtn = document.getElementById("checkoutWhatsAppBtn");

  if (openBtn) openBtn.addEventListener("click", openCart);
  if (closeBtn) closeBtn.addEventListener("click", closeCart);
  if (backdrop) backdrop.addEventListener("click", closeCart);

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (ACHAR_CART.length === 0) {
        showToast("Your bag is currently empty.");
        return;
      }
      // Generate formatted multi-product WhatsApp order message
      let message = `Namaskaram Achar & Co.! 🌶️\nI would like to order the following items from your Kerala heritage pickle collection:\n\n`;
      let total = 0;

      ACHAR_CART.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        message += `${index + 1}. *${item.name}*\n   Pack Size: ${item.size}\n   Quantity: ${item.qty}\n   Subtotal: ₹${itemTotal}\n\n`;
      });

      message += `------------------------------\n*Estimated Total: ₹${total}*\nDelivery Location in Kerala: [Please enter your town/district]\n------------------------------\n\nPlease confirm batch availability, courier delivery charges to my district, and payment options. Thank you!`;

      const waUrl = ACHAR_CONFIG.getWhatsAppUrl(message);
      window.open(waUrl, "_blank");
      showToast("Opening WhatsApp with your order details...");
    });
  }

  renderCartItems();
}

function openCart() {
  const drawer = document.getElementById("cartDrawer");
  const backdrop = document.getElementById("cartBackdrop");
  if (drawer && backdrop) {
    renderCartItems();
    drawer.classList.add("open");
    backdrop.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}

function closeCart() {
  const drawer = document.getElementById("cartDrawer");
  const backdrop = document.getElementById("cartBackdrop");
  if (drawer && backdrop) {
    drawer.classList.remove("open");
    backdrop.classList.remove("open");
    document.body.style.overflow = "";
  }
}

function addToCart(productId, size = "250g", qty = 1) {
  const product = ACHAR_CONFIG.products.find(p => p.id === productId || p.slug === productId);
  if (!product) return;

  if (product.is_out_of_stock) {
    showToast(`${product.name} is currently Out of Stock.`);
    return;
  }

  const price = product.prices[size] || 0;
  const key = `${product.id}_${size}`;
  const existing = ACHAR_CART.find(item => item.key === key);

  if (existing) {
    existing.qty += qty;
  } else {
    ACHAR_CART.push({
      key,
      id: product.id,
      name: product.name,
      size,
      price,
      qty,
      image: product.image
    });
  }

  saveCart();
  renderCartItems();
  updateCartBadge();
  showToast(`Added ${product.name} (${size}) to your bag!`);
}

function updateCartQty(key, delta) {
  const item = ACHAR_CART.find(i => i.key === key);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    ACHAR_CART = ACHAR_CART.filter(i => i.key !== key);
  }
  saveCart();
  renderCartItems();
  updateCartBadge();
}

function removeCartItem(key) {
  ACHAR_CART = ACHAR_CART.filter(i => i.key !== key);
  saveCart();
  renderCartItems();
  updateCartBadge();
  showToast("Item removed from bag.");
}

function saveCart() {
  localStorage.setItem("achar_co_cart", JSON.stringify(ACHAR_CART));
}

function updateCartBadge() {
  const badge = document.getElementById("bagCountBadge");
  if (badge) {
    const count = ACHAR_CART.reduce((sum, item) => sum + item.qty, 0);
    badge.textContent = count;
  }
}

function renderCartItems() {
  const container = document.getElementById("cartItemsContainer");
  const subtotalEl = document.getElementById("cartSubtotalDisplay");
  const countHeader = document.getElementById("drawerItemCount");
  if (!container || !subtotalEl) return;

  const totalCount = ACHAR_CART.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = ACHAR_CART.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (countHeader) countHeader.textContent = `(${totalCount})`;
  subtotalEl.textContent = `₹${totalAmount.toLocaleString("en-IN")}`;

  if (ACHAR_CART.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 10px; color: var(--ink-light);">
        <div style="font-size: 32px; margin-bottom: 12px; color: var(--gold-turmeric);">🧺</div>
        <p style="font-family: var(--font-serif); font-size: 17px; color: var(--green-deep);">Your bag is empty</p>
        <p style="font-size: 13px;">Add some heirloom Kerala pickles to continue.</p>
        <a href="products.html" class="btn btn-primary btn-sm" style="margin-top: 16px;" onclick="closeCart()">Browse Pickles &rarr;</a>
      </div>
    `;
    return;
  }

  container.innerHTML = ACHAR_CART.map(item => `
    <div class="cart-item-row">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <b>${item.name}</b>
        <small>${item.size} &middot; ₹${item.price.toLocaleString("en-IN")}</small>
        <div class="cart-qty-ctrl">
          <button type="button" onclick="updateCartQty('${item.key}', -1)" aria-label="Decrease">&minus;</button>
          <span>${item.qty}</span>
          <button type="button" onclick="updateCartQty('${item.key}', 1)" aria-label="Increase">&#43;</button>
        </div>
      </div>
      <div class="cart-item-price">
        <b>₹${(item.price * item.qty).toLocaleString("en-IN")}</b>
        <button class="btn-del" onclick="removeCartItem('${item.key}')">Remove</button>
      </div>
    </div>
  `).join("");
}

/**
 * Direct WhatsApp Order for a Single Product
 */
function orderSingleProductOnWhatsApp(productId) {
  const product = ACHAR_CONFIG.products.find(p => p.id === productId || p.slug === productId);
  if (!product) return;

  if (product.is_out_of_stock) {
    showToast(`${product.name} is currently Out of Stock.`);
    return;
  }

  const sizeSelect = document.getElementById(`sizeSelect-${productId}`);
  const selectedSize = sizeSelect ? sizeSelect.value : "250g";
  const price = product.prices[selectedSize] || 0;

  const msg = `Namaskaram Achar & Co.! 🌶️\n\nI would like to order:\n• Product: *${product.name}* (${product.malayalamName})\n• Pack Size: *${selectedSize}*\n• Estimated Price: *₹${price}*\n• Delivery: Across Kerala\n\nPlease let me know dispatch availability and courier charges to my district. Thank you!`;

  const url = ACHAR_CONFIG.getWhatsAppUrl(msg);
  window.open(url, "_blank");
}

/**
 * Quick View Product Modal with Multi-Image Support
 */
function openQuickView(productId) {
  const product = ACHAR_CONFIG.products.find(p => p.id === productId || p.slug === productId);
  if (!product) return;

  const modalBackdrop = document.getElementById("quickViewModal");
  const modalBody = document.getElementById("quickViewContent");
  if (!modalBackdrop || !modalBody) return;

  const productImages = product.images && product.images.length > 0
    ? product.images
    : [{ image_url: product.image, alt_text: product.name }];

  const thumbsHtml = productImages.length > 1 ? `
    <div class="quickview-thumbs">
      ${productImages.map((img, idx) => `
        <div class="quickview-thumb-item ${idx === 0 ? 'active' : ''}" onclick="switchQuickViewImage('${img.image_url}', this)">
          <img src="${img.image_url}" alt="Thumbnail ${idx + 1}">
        </div>
      `).join('')}
    </div>
  ` : '';

  modalBody.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px;">
      <div>
        <img id="quickViewMainImage" src="${product.image}" alt="${product.name}" style="width: 100%; height: 280px; object-fit: cover; border-radius: 4px; border: 1px solid var(--cream-line);">
        ${thumbsHtml}
        <div style="margin-top: 14px; background: var(--cream-soft); padding: 12px; border-radius: 4px; font-size: 11px;">
          <b style="color: var(--green-deep); display: block; margin-bottom: 4px;">🌿 Traditional Preparation Note:</b>
          <p style="margin: 0; line-height: 1.5; color: var(--ink-muted);">Made in small unhurried batches. Free from synthetic vinegar, chemical preservatives, or artificial food dyes.</p>
        </div>
      </div>
      <div>
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
          <span class="eyebrow no-after" style="margin: 0;">${product.category} &middot; ${product.badge}</span>
          ${product.is_out_of_stock ? '<span class="product-badge out-of-stock" style="position: static; font-size: 9px; padding: 2px 7px;">OUT OF STOCK</span>' : ''}
        </div>
        <h3 style="margin-bottom: 2px;">${product.name}</h3>
        <p class="malayalam-script" style="margin-bottom: 14px; font-size: 13px; color: var(--gold-turmeric); font-weight: 600;">${product.malayalamName}</p>
        <p style="font-size: 13px; line-height: 1.7; color: var(--ink-muted); margin-bottom: 16px;">${product.fullStory}</p>
        
        <div style="background: var(--cream-paper); border: 1px solid var(--cream-line); border-radius: 4px; padding: 14px; margin-bottom: 18px;">
          <div style="margin-bottom: 10px;">
            <b style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--green-deep); display: block;">Ingredients:</b>
            <span style="font-size: 12px; color: var(--ink-muted);">${product.ingredients}</span>
          </div>
          <div style="margin-bottom: 10px;">
            <b style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--red-chilli); display: block;">Allergen Information:</b>
            <span style="font-size: 12px; color: var(--ink-muted);">${product.allergens}</span>
          </div>
          <div>
            <b style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gold-turmeric); display: block;">Storage & Shelf Life:</b>
            <span style="font-size: 12px; color: var(--ink-muted);">${product.storage} (${product.shelfLife})</span>
          </div>
        </div>

        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 16px;">
          <label style="font-size: 12px; font-weight: 700; color: var(--green-deep);">Pack Size:</label>
          <select id="modalSizeSelect" class="size-selector" onchange="updateModalPrice('${product.id}', this.value)" ${product.is_out_of_stock ? 'disabled' : ''}>
            ${Object.entries(product.prices).map(([sz, pr]) => `<option value="${sz}">${sz} &mdash; ₹${pr}</option>`).join("")}
          </select>
          <b id="modalPriceLabel" style="font-family: var(--font-serif); font-size: 20px; color: var(--green-deep); margin-left: auto;">₹${product.prices["250g"]}</b>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <button class="btn btn-wa btn-sm ${product.is_out_of_stock ? 'disabled' : ''}" onclick="orderModalProduct('${product.id}')" ${product.is_out_of_stock ? 'disabled' : ''}>
            ${product.is_out_of_stock ? 'Out of Stock' : 'Order on WhatsApp &rarr;'}
          </button>
          <button class="btn btn-primary btn-sm ${product.is_out_of_stock ? 'disabled' : ''}" onclick="addModalToBag('${product.id}')" ${product.is_out_of_stock ? 'disabled' : ''}>
            ${product.is_out_of_stock ? 'Unavailable' : 'Add to Bag +'}
          </button>
        </div>
      </div>
    </div>
  `;

  modalBackdrop.classList.add("open");
  document.body.style.overflow = "hidden";
}

function switchQuickViewImage(url, element) {
  const mainImg = document.getElementById("quickViewMainImage");
  if (mainImg) mainImg.src = url;
  document.querySelectorAll(".quickview-thumb-item").forEach(el => el.classList.remove("active"));
  if (element) element.classList.add("active");
}

function updateModalPrice(productId, size) {
  const product = ACHAR_CONFIG.products.find(p => p.id === productId || p.slug === productId);
  if (!product) return;
  const label = document.getElementById("modalPriceLabel");
  if (label) {
    label.textContent = `₹${product.prices[size]}`;
  }
}

function closeQuickView() {
  const modalBackdrop = document.getElementById("quickViewModal");
  if (modalBackdrop) {
    modalBackdrop.classList.remove("open");
    document.body.style.overflow = "";
  }
}

function orderModalProduct(productId) {
  const select = document.getElementById("modalSizeSelect");
  const size = select ? select.value : "250g";
  const product = ACHAR_CONFIG.products.find(p => p.id === productId || p.slug === productId);
  if (!product || product.is_out_of_stock) return;

  const price = product.prices[size];
  const msg = `Namaskaram Achar & Co.! 🌶️\nI would like to order:\n• Product: *${product.name}*\n• Pack Size: *${size}*\n• Estimated Price: *₹${price}*\n• Delivery: Across Kerala\n\nPlease share delivery options and availability.`;
  window.open(ACHAR_CONFIG.getWhatsAppUrl(msg), "_blank");
}

function addModalToBag(productId) {
  const select = document.getElementById("modalSizeSelect");
  const size = select ? select.value : "250g";
  addToCart(productId, size);
  closeQuickView();
}

/**
 * Toast Notification system
 */
function showToast(text) {
  let toast = document.getElementById("globalToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "globalToast";
    toast.className = "toast-msg";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span>🌶️</span> ${text}`;
  toast.classList.add("show");

  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

/**
 * Placeholders Helper: Ensures dynamic placeholder fields display cleanly
 */
function setupGlobalPlaceholders() {
  document.querySelectorAll("[data-config-phone]").forEach(el => {
    el.textContent = ACHAR_CONFIG.displayPhone;
  });
  document.querySelectorAll("[data-config-email]").forEach(el => {
    el.textContent = ACHAR_CONFIG.displayEmail;
  });
  document.querySelectorAll("[data-config-address]").forEach(el => {
    el.textContent = ACHAR_CONFIG.address;
  });
}
