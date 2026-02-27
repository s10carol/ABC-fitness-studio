/* =============================================
   ABC FITNESS STUDIO — MAIN JAVASCRIPT
   Features:
   - Navigation bar active state
   - Subscribe feature
   - Add to Cart / View Cart / Clear Cart / Process Order
   - Session Storage for cart
   - Contact form validation + Local Storage
   - Custom Feedback feature
   ============================================= */

/* ── NAVIGATION: Highlight active page ── */
function setActiveNav() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll("nav ul li a");
  navLinks.forEach(link => {
    const linkPage = link.getAttribute("href");
    if (linkPage === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

/* ── SUBSCRIBE FEATURE ── */
function initSubscribe() {
  const subscribeBtn = document.getElementById("subscribe-btn");
  const subscribeInput = document.getElementById("subscribe-email");
  if (!subscribeBtn || !subscribeInput) return;

  subscribeBtn.addEventListener("click", function () {
    const email = subscribeInput.value.trim();

    // Input validation
    if (email === "") {
      showAlert("Please enter your email address.", "error");
      return;
    }
    if (!isValidEmail(email)) {
      showAlert("Please enter a valid email address.", "error");
      return;
    }

    // Save to localStorage
    let subscribers = JSON.parse(localStorage.getItem("subscribers") || "[]");
    if (subscribers.includes(email)) {
      showAlert("You are already subscribed!", "info");
      return;
    }
    subscribers.push(email);
    localStorage.setItem("subscribers", JSON.stringify(subscribers));
    subscribeInput.value = "";
    showAlert("Thank you for subscribing! You will receive our latest updates.", "success");
  });
}

/* ── SHOPPING CART: Session Storage ── */

// Get cart from sessionStorage
function getCart() {
  return JSON.parse(sessionStorage.getItem("abcCart") || "[]");
}

// Save cart to sessionStorage
function saveCart(cart) {
  sessionStorage.setItem("abcCart", JSON.stringify(cart));
}

// Add item to cart
function addToCart(name, price) {
  const cart = getCart();
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  saveCart(cart);
  updateCartBadge();
  showAlert(`"${name}" has been added to your cart!`, "success");
}

// Update cart badge count
function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  const badges = document.querySelectorAll(".cart-badge");
  badges.forEach(badge => {
    badge.textContent = `(${total} item${total !== 1 ? "s" : ""})`;
  });
}

// View cart modal
function viewCart() {
  const cart = getCart();
  const modal = document.getElementById("cart-modal");
  const cartBody = document.getElementById("cart-body");
  const cartTotal = document.getElementById("cart-total");
  if (!modal || !cartBody) return;

  if (cart.length === 0) {
    cartBody.innerHTML = "<tr><td colspan='4' style='text-align:center; padding:20px; color:#666;'>Your cart is empty.</td></tr>";
    if (cartTotal) cartTotal.textContent = "$0.00";
  } else {
    let rows = "";
    let total = 0;
    cart.forEach(item => {
      const subtotal = item.price * item.qty;
      total += subtotal;
      rows += `
        <tr>
          <td style="padding:10px 14px;">${item.name}</td>
          <td style="padding:10px 14px;">$${item.price.toFixed(2)}</td>
          <td style="padding:10px 14px;">${item.qty}</td>
          <td style="padding:10px 14px; font-weight:bold;">$${subtotal.toFixed(2)}</td>
        </tr>`;
    });
    cartBody.innerHTML = rows;
    if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
  }
  modal.style.display = "flex";
}

// Close cart modal
function closeCart() {
  const modal = document.getElementById("cart-modal");
  if (modal) modal.style.display = "none";
}

// Process order
function processOrder() {
  const cart = getCart();
  if (cart.length === 0) {
    showAlert("Your cart is empty. Please add items before processing an order.", "error");
    return;
  }
  // Check if already processed in this session
  if (sessionStorage.getItem("orderProcessed") === "true") {
    showAlert("Your order has already been processed!", "info");
    return;
  }
  sessionStorage.setItem("orderProcessed", "true");
  showAlert("Your order has been successfully processed! Thank you for shopping with ABC Fitness Studio.", "success");
  closeCart();
}

// Clear cart
function clearCart() {
  const cart = getCart();
  if (cart.length === 0) {
    showAlert("Your cart is already empty.", "info");
    closeCart();
    return;
  }
  saveCart([]);
  sessionStorage.removeItem("orderProcessed");
  updateCartBadge();
  showAlert("Your cart has been cleared.", "info");
  closeCart();
}

// Initialize Add to Cart buttons
function initCartButtons() {
  const buttons = document.querySelectorAll(".btn-cart");
  buttons.forEach(btn => {
    btn.addEventListener("click", function () {
      const row = this.closest("tr") || this.closest(".card");
      let name = "Item";
      let price = 0;
      if (row) {
        const nameEl = row.querySelector("strong") || row.querySelector("h3");
        const priceEl = row.querySelector(".price-col") || row.querySelector(".price");
        if (nameEl) name = nameEl.textContent.trim();
        if (priceEl) {
          const priceText = priceEl.textContent.replace(/[^0-9.]/g, "");
          price = parseFloat(priceText) || 0;
        }
      }
      addToCart(name, price);
    });
  });

  // View cart button
  const viewCartBtns = document.querySelectorAll(".view-cart-btn");
  viewCartBtns.forEach(btn => {
    btn.addEventListener("click", viewCart);
  });
}

/* ── CONTACT FORM: Validation + LocalStorage ── */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  // Pre-fill from localStorage if saved
  const saved = JSON.parse(localStorage.getItem("contactFormData") || "{}");
  if (saved.name) document.getElementById("full-name").value = saved.name;
  if (saved.email) document.getElementById("email").value = saved.email;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("full-name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const subject = document.getElementById("subject").value;
    const message = document.getElementById("message").value.trim();

    // Validation
    if (name === "") {
      showAlert("Please enter your full name.", "error");
      return;
    }
    if (email === "") {
      showAlert("Please enter your email address.", "error");
      return;
    }
    if (!isValidEmail(email)) {
      showAlert("Please enter a valid email address.", "error");
      return;
    }
    if (phone !== "" && !isValidPhone(phone)) {
      showAlert("Please enter a valid phone number.", "error");
      return;
    }
    if (subject === "") {
      showAlert("Please select a subject.", "error");
      return;
    }
    if (message === "") {
      showAlert("Please enter a message.", "error");
      return;
    }

    // Save to localStorage
    const formData = { name, email, phone, subject, message, date: new Date().toISOString() };
    localStorage.setItem("contactFormData", JSON.stringify(formData));

    showAlert("Thank you, " + name + "! Your message has been sent. We will respond within 24 hours.", "success");
    form.reset();
  });
}

/* ── CUSTOMER FEEDBACK FEATURE ── */
function initFeedback() {
  const feedbackBtn = document.getElementById("feedback-submit");
  if (!feedbackBtn) return;

  feedbackBtn.addEventListener("click", function () {
    const rating = document.querySelector('input[name="rating"]:checked');
    const comment = document.getElementById("feedback-comment").value.trim();

    if (!rating) {
      showAlert("Please select a star rating.", "error");
      return;
    }
    if (comment === "") {
      showAlert("Please enter your feedback comment.", "error");
      return;
    }

    // Save to localStorage
    let feedbackList = JSON.parse(localStorage.getItem("feedbackList") || "[]");
    feedbackList.push({ rating: rating.value, comment, date: new Date().toISOString() });
    localStorage.setItem("feedbackList", JSON.stringify(feedbackList));

    showAlert("Thank you for your feedback! We appreciate you sharing your experience.", "success");
    document.getElementById("feedback-comment").value = "";
    document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false);
  });
}

/* ── UTILITY FUNCTIONS ── */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[\d\s\-\(\)\+]{7,15}$/.test(phone);
}

function showAlert(message, type) {
  // Remove existing alert
  const existing = document.getElementById("custom-alert");
  if (existing) existing.remove();

  const colors = {
    success: { bg: "#d4edda", border: "#20458E", text: "#001F3F" },
    error:   { bg: "#f8d7da", border: "#dc3545", text: "#721c24" },
    info:    { bg: "#d1ecf1", border: "#634E99", text: "#0c5460" }
  };
  const c = colors[type] || colors.info;

  const alert = document.createElement("div");
  alert.id = "custom-alert";
  alert.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 9999;
    background: ${c.bg}; border: 2px solid ${c.border}; color: ${c.text};
    padding: 16px 24px; border-radius: 6px; font-family: Arial, sans-serif;
    font-size: 15px; max-width: 380px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
  `;
  alert.textContent = message;

  const closeBtn = document.createElement("span");
  closeBtn.textContent = " ✕";
  closeBtn.style.cssText = "cursor:pointer; font-weight:bold; margin-left:10px;";
  closeBtn.onclick = () => alert.remove();
  alert.appendChild(closeBtn);

  document.body.appendChild(alert);
  setTimeout(() => { if (alert.parentNode) alert.remove(); }, 4000);
}

/* ── INIT ALL ON PAGE LOAD ── */
document.addEventListener("DOMContentLoaded", function () {
  setActiveNav();
  initSubscribe();
  initCartButtons();
  initContactForm();
  initFeedback();
  updateCartBadge();
});
