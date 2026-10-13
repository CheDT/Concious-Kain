const meals = [
  { id: '53070', name: 'Beef Caldereta', price: 115, category: 'Ulam', tags: ['Rice meal', 'Classic'], description: 'Tender beef simmered in a rich tomato sauce with potatoes, carrots, and bell peppers. Served with steamed rice.' },
  { id: '53073', name: 'Talong Adobo', price: 85, category: 'Gulay', tags: ['Vegetable', 'Savory'], description: 'Eggplant cooked in soy sauce, vinegar, garlic, and bay leaves. A familiar adobo flavor with a vegetable twist. Served with steamed rice.' },
  { id: '53075', name: 'Tortang Talong', price: 75, category: 'Almusal', tags: ['Egg & talong', 'Classic'], description: 'Smoky grilled eggplant dipped in egg and pan-fried until golden. Served with garlic rice and a little banana ketchup.' },
  { id: '53069', name: 'Bistek Tagalog', price: 110, category: 'Ulam', tags: ['Rice meal', 'Calamansi'], description: 'Beef slices marinated in calamansi and soy sauce, topped with sweet onion rings. Served with steamed rice.' },
  { id: '53074', name: 'Ginataang Talong', price: 90, category: 'Gulay', tags: ['Coconut milk', 'Vegetable'], description: 'Grilled eggplant in a creamy coconut sauce with garlic and a gentle kick of chili. Served with steamed rice.' },
  { id: '53072', name: 'Crispy Talong', price: 65, category: 'Meryenda', tags: ['Crispy', 'For sharing'], description: 'Lightly battered eggplant slices, fried until crisp and served with a tangy dipping sauce. A simple snack to share.' },
  { id: '53071', name: 'Beef Asado', price: 105, category: 'Ulam', tags: ['Rice meal', 'Sweet-savory'], description: 'Slow-braised beef in a sweet and savory sauce with potatoes and warm spices. Served with steamed rice.' },
  { id: '53068', name: 'Beef Mechado', price: 110, category: 'Ulam', tags: ['Rice meal', 'Tomato stew'], description: 'A comforting beef stew with potatoes, tomatoes, and bell peppers, finished with calamansi. Served with steamed rice.' }
];
const categories = [{ name: 'All', icon: 'leaf' }, { name: 'Ulam', icon: 'bowl' }, { name: 'Gulay', icon: 'leaf' }, { name: 'Almusal', icon: 'sun' }, { name: 'Meryenda', icon: 'snack' }];
const storageKey = 'conscious-kain-demo-v1';
const defaultCart = () => ({ '53070': 1, '53073': 1, '53075': 1 });
const state = { page: 'home', category: 'All', query: '', sort: 'recommended', favoritesOnly: false, cart: defaultCart(), favorites: [], orders: [], promo: '', customer: {}, addresses: [], selectedAddress: '', fulfillment: 'delivery', latestOrder: null };
const header = document.querySelector('#app-header');
const content = document.querySelector('#app-content');
const tabs = document.querySelector('#tab-bar');
const dialog = document.querySelector('#app-dialog');
let toastTimer;
let returnFocus;
let dialogCloseTimer;
let storageWarning = false;
function escapeHTML(value = '') { return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]); }
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const money = amount => `₱${amount.toLocaleString('en-PH', { maximumFractionDigits: 2 })}`;
const findMeal = id => meals.find(meal => meal.id === id);
const imagePath = meal => `assets/${meal.id}.jpg`;
const count = () => Object.values(state.cart).reduce((total, quantity) => total + quantity, 0);
function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (!saved || typeof saved !== 'object') return;
    if (saved.cart && typeof saved.cart === 'object') state.cart = Object.fromEntries(Object.entries(saved.cart).filter(([id, quantity]) => findMeal(id) && Number.isInteger(quantity) && quantity > 0 && quantity <= 99));
    if (Array.isArray(saved.favorites)) state.favorites = saved.favorites.filter(id => findMeal(id));
    if (Array.isArray(saved.orders)) state.orders = saved.orders.filter(order => order && typeof order.id === 'string' && Array.isArray(order.items) && order.items.every(item => findMeal(item.id) && Number.isInteger(item.quantity) && item.quantity > 0) && Number.isFinite(order.total) && typeof order.customer === 'object' && order.customer).slice(0, 20);
    if (saved.customer && typeof saved.customer === 'object') state.customer = Object.fromEntries(Object.entries(saved.customer).filter(([key, value]) => ['name', 'phone', 'street', 'barangay', 'city', 'notes', 'payment'].includes(key) && typeof value === 'string'));
    if (saved.promo === 'KAIN10') state.promo = saved.promo;
    if (Array.isArray(saved.addresses)) state.addresses = saved.addresses.filter(address => address && typeof address.id === 'string' && typeof address.street === 'string' && typeof address.city === 'string').slice(0, 10);
    if (typeof saved.selectedAddress === 'string') state.selectedAddress = saved.selectedAddress;
    if (saved.fulfillment === 'pickup') state.fulfillment = 'pickup';
  } catch { storageWarning = true; }
}
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify({ cart: state.cart, favorites: state.favorites, orders: state.orders, promo: state.promo, customer: state.customer, addresses: state.addresses, selectedAddress: state.selectedAddress, fulfillment: state.fulfillment })); }
  catch { if (!storageWarning) { notify('Your browser could not save changes. You can keep using this tab.'); storageWarning = true; } }
}
function notify(message) {
  const toast = document.querySelector('#toast'); toast.textContent = message; toast.classList.add('visible'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2500);
}
function cartButton() { return `<button class="cart-button" data-page="cart" aria-label="Cart, ${count()} items">${icon('cart')}${count() ? `<span class="cart-badge">${count()}</span>` : ''}</button>`; }
function updateCartBadge() { const button = header.querySelector('.cart-button'); if (button) button.outerHTML = cartButton(); }
function deliveryBar() {
  const address = state.fulfillment === 'pickup' ? 'Kain Kitchen · Store pickup' : state.customer.street ? `${state.customer.street}, ${state.customer.city || ''}` : 'Choose your delivery address';
  return `<button class="delivery-bar" data-action="addresses">${icon('pin')}<span><small>${state.fulfillment === 'pickup' ? 'PICK UP AT' : 'DELIVER TO'}</small><strong>${escapeHTML(address)}</strong></span>${icon('next')}</button>`;
}
function searchBox() { return `<div class="search-box">${icon('search')}<input id="meal-search" type="search" aria-label="Search meals" placeholder="${state.page === 'home' ? 'Search meals, ingredients, or cravings…' : 'Search Filipino meals…'}" value="${escapeHTML(state.query)}"><button class="icon-button" data-action="filters" aria-label="Filter and sort meals">${icon('filter')}</button></div>`; }
function renderHeader() {
  const firstName = (state.customer.name || 'Jocelyn').trim().split(/\s+/)[0];
  if (state.page === 'home') header.innerHTML = `${deliveryBar()}<div class="greeting"><button class="avatar" data-page="profile" aria-label="Open profile">${escapeHTML(firstName.charAt(0).toUpperCase())}</button><div><h1>Hello, ${escapeHTML(firstName)}!</h1><p>Kain tayo, the feel-good way.</p></div>${cartButton()}</div>${searchBox()}`;
  else {
    const titles = { explore: 'explore', cart: 'Cart', checkout: 'Checkout', orders: 'My Orders', profile: 'Profile', success: 'Salamat!' };
    header.innerHTML = `<div class="page-heading"><button class="icon-button" data-action="back" aria-label="Go back">${icon('back')}</button><h1>${titles[state.page]}</h1>${['checkout', 'success'].includes(state.page) ? '<span class="heading-spacer"></span>' : cartButton()}</div>${state.page === 'explore' ? searchBox() : ''}`;
  }
}
function renderTabs() {
  const active = ['cart', 'checkout', 'success'].includes(state.page) ? '' : state.page;
  tabs.innerHTML = [{ page: 'home', label: 'Home', icon: 'home' }, { page: 'explore', label: 'Explore', icon: 'search' }, { page: 'orders', label: 'Orders', icon: 'orders' }, { page: 'profile', label: 'Profile', icon: 'user' }].map(tab => `<button data-page="${tab.page}" class="${active === tab.page ? 'active' : ''}" ${active === tab.page ? 'aria-current="page"' : ''}>${icon(tab.icon)}<span>${tab.label}</span></button>`).join('');
}
function filteredMeals() {
  const query = state.query.trim().toLowerCase();
  const filtered = meals.filter(meal => (state.category === 'All' || state.category === meal.category) && (!state.favoritesOnly || state.favorites.includes(meal.id)) && `${meal.name} ${meal.category} ${meal.description} ${meal.tags.join(' ')}`.toLowerCase().includes(query));
  if (state.sort === 'price-low') filtered.sort((a, b) => a.price - b.price);
  if (state.sort === 'price-high') filtered.sort((a, b) => b.price - a.price);
  if (state.sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
  return filtered;
}
function tags(meal) { return `<div class="tags">${meal.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>`; }
function addButton(meal) { return `<button class="add-button" data-action="add" data-id="${meal.id}" aria-label="Add ${meal.name} to cart">${icon('plus')}</button>`; }
function foodCard(meal) { return `<article class="food-card"><button class="food-open" data-action="detail" data-id="${meal.id}" aria-label="View ${meal.name}"><img class="food-photo" src="${imagePath(meal)}" alt="${meal.name}" loading="lazy" width="100" height="88"><h3>${meal.name}</h3></button><button class="favorite ${state.favorites.includes(meal.id) ? 'saved' : ''}" data-action="favorite" data-id="${meal.id}" aria-label="Save ${meal.name}" aria-pressed="${state.favorites.includes(meal.id)}">${icon('heart')}</button><div class="card-price"><span class="price">${money(meal.price)}</span>${addButton(meal)}</div>${tags(meal)}</article>`; }
function foodRow(meal) { return `<article class="food-row"><button class="row-open" data-action="detail" data-id="${meal.id}" aria-label="View ${meal.name}"><img class="row-photo" src="${imagePath(meal)}" alt="${meal.name}" loading="lazy" width="94" height="94"></button><div class="row-info"><h3>${meal.name}</h3><p>Type: <span>${meal.category}</span></p>${tags(meal)}<span class="price">${money(meal.price)}</span></div>${addButton(meal)}</article>`; }
function emptyMeals() { return `<div class="empty-state">${icon('search')}<h2>No meals found</h2><p>${state.favoritesOnly ? 'Save a dish with the heart button, or browse the whole menu.' : 'Try another dish or ingredient, or clear your filters.'}</p><button class="primary-button" data-action="clear-filters">Show all meals</button></div>`; }
function renderResults() {
  const result = document.querySelector('#meal-results'); if (!result) return;
  const selected = filteredMeals(); result.className = selected.length ? (state.page === 'home' ? 'food-grid' : 'food-list') : '';
  result.innerHTML = selected.length ? selected.map(state.page === 'home' ? foodCard : foodRow).join('') : emptyMeals();
}
function renderHome() { return `<section class="hero" aria-label="Conscious Kain"><svg class="icon hero-leaf" aria-hidden="true"><use href="#i-leaf"/></svg><svg class="icon hero-leaf second" aria-hidden="true"><use href="#i-leaf"/></svg><div class="hero-copy"><h2>Conscious<br>Kain</h2><p>Pinoy favorites.<br>Sarap within your budget.</p><button data-page="explore">Order Now</button></div><img class="hero-photo" src="assets/53070.jpg" alt="A bowl of Filipino beef caldereta" fetchpriority="high"></section><div class="categories" aria-label="Meal categories">${categories.map(category => `<button class="category ${state.category === category.name ? 'active' : ''}" data-category="${category.name}" aria-pressed="${state.category === category.name}"><span class="category-circle">${icon(category.icon)}</span>${category.name}</button>`).join('')}</div><div class="section-heading"><h2>Today’s Picks</h2><button class="text-button" data-page="explore">See All ${icon('next')}</button></div><div id="meal-results"></div>`; }
function renderExplore() { return `<div class="pills" aria-label="Meal categories">${categories.map(category => `<button class="pill ${state.category === category.name ? 'active' : ''}" data-category="${category.name}" aria-pressed="${state.category === category.name}">${category.name}</button>`).join('')}</div><h2 class="recommend-title">${state.favoritesOnly ? 'Your favorites' : 'Recommendation'} <span aria-hidden="true">★</span></h2><div id="meal-results"></div>`; }
function totals() {
  const subtotal = meals.reduce((sum, meal) => sum + meal.price * (state.cart[meal.id] || 0), 0); const fee = subtotal ? 10 : 0;
  const discount = state.promo === 'KAIN10' ? Math.round(subtotal * .1) : 0;
  const deliveryFee = subtotal && state.fulfillment === 'delivery' ? 25 : 0;
  return { subtotal, fee, deliveryFee, discount, total: subtotal + fee + deliveryFee - discount };
}
function summary() {
  const total = totals();
  return `<div class="summary"><div class="summary-line"><span>Subtotal</span><strong>${money(total.subtotal)}</strong></div><div class="summary-line"><span>Service Fee</span><strong>${money(total.fee)}</strong></div><div class="summary-line"><span>${state.fulfillment === 'delivery' ? 'Delivery Fee' : 'Pickup'}</span><strong>${state.fulfillment === 'delivery' ? money(total.deliveryFee) : 'Free'}</strong></div>${total.discount ? `<div class="summary-line discount"><span>KAIN10 discount</span><strong>−${money(total.discount)}</strong></div>` : ''}<div class="summary-total"><span>Total Payment</span><small>(${count()} ${count() === 1 ? 'item' : 'items'})</small><strong>${money(total.total)}</strong></div></div>`;
}
function renderCart() {
  if (!count()) return `<div class="empty-state">${icon('cart')}<h2>Your cart is empty</h2><p>Something delicious is waiting.<br>Add your favorite Filipino dishes to get started.</p><button class="primary-button" data-page="explore">Find a meal</button></div>`;
  return `<div class="cart-list">${meals.filter(meal => state.cart[meal.id]).map(meal => `<article class="cart-row"><img class="row-photo" src="${imagePath(meal)}" alt="${meal.name}" width="72" height="79"><div class="cart-info"><h3>${meal.name}</h3><p>Type: ${meal.category}</p><span class="price">${money(meal.price * state.cart[meal.id])}</span></div><button class="icon-button remove-button" data-action="remove" data-id="${meal.id}" aria-label="Remove ${meal.name}">${icon('trash')}</button><div class="stepper" aria-label="${meal.name} quantity"><button data-action="decrease" data-id="${meal.id}" aria-label="Decrease ${meal.name}">${icon('minus')}</button><span aria-live="polite">${state.cart[meal.id]}</span><button data-action="increase" data-id="${meal.id}" aria-label="Increase ${meal.name}">${icon('plus')}</button></div></article>`).join('')}<button class="add-more" data-page="explore">Add more item ${icon('next')}</button></div><section class="promo-panel"><h2><span class="promo-symbol">%</span>Have a promo code?</h2><form class="promo-form" id="promo-form"><input name="promo" aria-label="Promo code" placeholder="Promo Code…" value="${state.promo}" autocomplete="off"><button type="submit">Apply</button></form><p class="promo-feedback" id="promo-feedback" role="status">${state.promo ? 'KAIN10 applied. Enjoy 10% off your meals.' : 'Use KAIN10 for 10% off.'}</p></section>${summary()}<button class="primary-button" data-page="checkout">Proceed to Checkout</button>`;
}
const checkoutFields = [
  { name: 'name', label: 'Full name', placeholder: 'Your full name', autocomplete: 'name', max: 100 },
  { name: 'phone', label: 'Mobile number', placeholder: '09XX XXX XXXX', autocomplete: 'tel', type: 'tel', max: 20, hint: 'Philippine mobile number, 09 or +63.' },
  { name: 'street', label: 'House / unit and street', placeholder: 'House or unit number, street name', autocomplete: 'address-line1', max: 150 },
  { name: 'barangay', label: 'Barangay', placeholder: 'Your barangay', autocomplete: 'address-line2', max: 100 },
  { name: 'city', label: 'City / municipality', placeholder: 'Your city or municipality', autocomplete: 'address-level2', max: 100 }
];
function fieldMarkup(field, prefix = '') {
  const id = (typeof prefix === 'string' ? prefix : '') + field.name;
  return `<label class="field" for="${id}">${field.label}<input id="${id}" name="${field.name}" type="${field.type || 'text'}" ${field.type === 'tel' ? 'inputmode="tel"' : ''} placeholder="${field.placeholder}" autocomplete="${field.autocomplete}" maxlength="${field.max}" required value="${escapeHTML(state.customer[field.name] || '')}" aria-describedby="${id}-error${field.hint ? ` ${id}-hint` : ''}">${field.hint ? `<small id="${id}-hint">${field.hint}</small>` : ''}<span class="field-error" id="${id}-error"></span></label>`;
}
function renderCheckout() {
  if (!count()) return renderCart();
  const pickup = state.fulfillment === 'pickup';
  const addressFields = checkoutFields.slice(2);
  return `<div class="fulfillment-options" aria-label="Order type"><button data-action="fulfillment" data-mode="delivery" class="${!pickup ? 'active' : ''}" aria-pressed="${!pickup}">${icon('pin')}Delivery</button><button data-action="fulfillment" data-mode="pickup" class="${pickup ? 'active' : ''}" aria-pressed="${pickup}">${icon('bowl')}Pickup</button></div><form id="checkout-form" novalidate><section class="form-section"><div class="section-heading"><h2>${pickup ? 'Pickup from' : 'Deliver to'}</h2>${!pickup ? '<button type="button" class="text-button" data-action="addresses">Saved addresses</button>' : ''}</div>${pickup ? '<p class="pickup-location"><strong>Kain Kitchen</strong><br>Counter pickup · Your order will be ready for collection.</p>' : `${addressFields.map(fieldMarkup).join('')}<label class="field" for="notes">Rider instructions <small style="display:inline">(optional)</small><textarea id="notes" name="notes" placeholder="Landmark, gate, or delivery instructions" maxlength="300">${escapeHTML(state.customer.notes || '')}</textarea></label>`}</section><section class="form-section"><div class="section-heading"><h2>Contact details</h2><button type="button" class="text-button" data-action="fill-demo">Autofill</button></div>${checkoutFields.slice(0, 2).map(fieldMarkup).join('')}</section><section class="form-section"><h2>Payment method</h2><div class="payment-options"><label class="payment-option"><input type="radio" name="payment" value="cod" ${(state.customer.payment || 'cod') === 'cod' ? 'checked' : ''}><span>Cash${pickup ? ' at pickup' : ' on delivery'}</span><span class="cash-icon" aria-hidden="true">₱</span></label><label class="payment-option"><input type="radio" name="payment" value="gcash" ${state.customer.payment === 'gcash' ? 'checked' : ''}><span>GCash</span><img class="gcash-logo" src="assets/gcash.svg" alt="" aria-hidden="true"></label></div></section>${summary()}<p class="form-message" id="form-message" role="alert"></p><button type="submit" class="primary-button">Place Order</button></form>`;
}
function validateField(input) {
  let message = ''; const value = input.value.trim();
  if (!value) message = `Enter your ${input.name === 'name' ? 'full name' : input.name === 'street' ? 'house / unit and street' : input.name === 'city' ? 'city or municipality' : input.name === 'phone' ? 'mobile number' : 'barangay'}.`;
  else if (input.name === 'name' && value.length < 2) message = 'Enter a name with at least two characters.';
  else if (input.name === 'phone' && !/^(09\d{9}|\+639\d{9}|639\d{9})$/.test(value.replace(/[\s()-]/g, ''))) message = 'Use an 11-digit number starting with 09, or +639 followed by 9 digits.';
  else if (input.name === 'street' && value.length < 5) message = 'Include your house / unit number and street.';
  input.setAttribute('aria-invalid', String(Boolean(message)));
  const error = document.getElementById(`${input.id}-error`); if (error) error.textContent = message;
  return !message;
}
function orderCard(order, complete = false) {
  const date = new Date(order.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
  const pickup = order.fulfillment === 'pickup';
  return `<article class="order-card"><h2>Order ${escapeHTML(order.id)}</h2><div class="order-meta"><span>${date}</span><span class="order-status">Order placed</span></div>${order.items.map(item => { const meal = findMeal(item.id); return `<div class="order-food"><img src="${imagePath(meal)}" alt="${meal.name}"><span>${item.quantity} × ${meal.name}</span><strong>${money(meal.price * item.quantity)}</strong></div>`; }).join('')}<div class="summary-total"><span>Total</span><strong>${money(order.total)}</strong></div>${complete ? `<p class="order-detail"><strong>${pickup ? 'Pickup from Kain Kitchen' : 'Deliver to'}</strong><br>${escapeHTML(order.customer.name)} · ${escapeHTML(order.customer.phone)}${pickup ? '' : `<br>${escapeHTML(order.customer.street)}<br>${escapeHTML(order.customer.barangay)}, ${escapeHTML(order.customer.city)}${order.customer.notes ? `<br>Note: ${escapeHTML(order.customer.notes)}` : ''}`}<br><strong>Payment:</strong> ${order.customer.payment === 'gcash' ? 'GCash' : pickup ? 'Cash at pickup' : 'Cash on delivery'}</p>` : `<p class="order-detail">${escapeHTML(order.customer.name)} · ${pickup ? 'Pickup' : escapeHTML(order.customer.city)}</p><button class="text-button" data-action="order-detail" data-order="${escapeHTML(order.id)}">View order ${icon('next')}</button>`}</article>`;
}
function renderOrders() { return state.orders.length ? state.orders.map(order => orderCard(order)).join('') : `<div class="empty-state">${icon('orders')}<h2>Your first order awaits</h2><p>Once you place an order, you’ll find it here<br>with your meal and delivery details.</p><button class="primary-button" data-page="explore">Browse the menu</button></div>`; }
function renderProfile() {
  const name = state.customer.name || 'Jocelyn';
  return `<div class="profile-heading"><div class="avatar">${escapeHTML(name.charAt(0).toUpperCase())}</div><h2>${escapeHTML(name)}</h2><p>${state.customer.city ? escapeHTML(state.customer.city) : 'Welcome to your little corner of Kain.'}</p></div><div class="menu-group"><button class="menu-row" data-action="saved">${icon('heart')}Saved meals<small>${state.favorites.length} saved</small>${icon('next')}</button><button class="menu-row" data-action="delivery-details">${icon('pin')}Delivery addresses${icon('next')}</button><button class="menu-row" data-page="orders">${icon('orders')}My orders${icon('next')}</button><button class="menu-row" data-action="settings">${icon('settings')}Settings${icon('next')}</button></div><section class="promo-panel"><h2>Kain tayo!</h2><p class="settings-note" style="margin-bottom:0">Filipino favorites, familiar flavors, and a little joy in every meal.</p></section>`;
}
function renderSuccess() { return `<div class="success-heading"><div class="success-mark">${icon('check')}</div><h2>Order placed!</h2><p>Salamat, ${escapeHTML((state.latestOrder.customer.name || '').split(/\s+/)[0])}!</p></div>${orderCard(state.latestOrder, true)}<button class="primary-button" data-page="orders">View My Orders</button><button class="text-button" style="margin:6px auto" data-page="home">Back to Home</button>`; }
function animateContent() {
  content.classList.remove('page-enter');
  void content.offsetWidth;
  content.classList.add('page-enter');
}
function render() { renderHeader(); renderTabs(); content.innerHTML = ({ home: renderHome, explore: renderExplore, cart: renderCart, checkout: renderCheckout, orders: renderOrders, profile: renderProfile, success: renderSuccess }[state.page])(); renderResults(); animateContent(); }
function navigate(page) {
  if (!['home', 'explore', 'cart', 'checkout', 'orders', 'profile', 'success'].includes(page)) return;
  if (page === 'success' && !state.latestOrder) page = 'orders';
  if (page === 'checkout' && !count()) { notify('Add a meal before checking out.'); page = 'cart'; }
  state.page = page; render(); content.scrollTop = 0;
}
function changeQuantity(id, delta) {
  if (!findMeal(id)) return;
  const quantity = (state.cart[id] || 0) + delta;
  if (quantity > 99) { notify('Maximum 99 of each meal.'); return; }
  if (quantity <= 0) delete state.cart[id]; else state.cart[id] = quantity;
  save();
  if (state.page === 'cart') { const scroll = content.scrollTop; content.innerHTML = renderCart(); content.scrollTop = scroll; }
  updateCartBadge();
}
function syncDialog() {
  const bounds = document.querySelector('.screen').getBoundingClientRect();
  Object.assign(dialog.style, { position: 'fixed', left: `${bounds.left + 10}px`, right: 'auto', top: 'auto', bottom: `${window.innerHeight - bounds.bottom + 16}px`, width: `${bounds.width - 20}px`, maxHeight: `${bounds.height - 40}px` });
}
function openDialog(title, body) {
  clearTimeout(dialogCloseTimer);
  dialog.classList.remove('closing');
  if (!dialog.open) returnFocus = document.activeElement;
  document.querySelector('#dialog-content').innerHTML = `<div class="dialog-heading"><h2 id="dialog-title">${title}</h2><button class="close-dialog" data-action="close" aria-label="Close dialog">×</button></div>${body}`;
  syncDialog(); if (!dialog.open) dialog.showModal();
  dialog.classList.remove('sheet-enter'); void dialog.offsetWidth; dialog.classList.add('sheet-enter');
}
function closeDialog() {
  if (!dialog.open) return;
  clearTimeout(dialogCloseTimer); dialog.classList.remove('sheet-enter'); dialog.classList.add('closing');
  dialogCloseTimer = setTimeout(() => { dialog.close(); dialog.classList.remove('closing'); if (returnFocus?.isConnected) returnFocus.focus(); }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 200);
}
function openSettings() { openDialog('Settings', `<div class="menu-group"><button class="menu-row" data-action="delivery-details">${icon('pin')}Manage addresses${icon('next')}</button><button class="menu-row" data-action="demo-reset">${icon('trash')}Reset app data${icon('next')}</button><button class="menu-row" data-action="about">${icon('leaf')}About Conscious Kain${icon('next')}</button></div>`); }
function openFilters() { openDialog('Filter meals', `<form id="filter-form"><label class="filter-option">Category<select name="category">${categories.map(category => `<option ${category.name === state.category ? 'selected' : ''}>${category.name}</option>`).join('')}</select></label><label class="filter-option">Sort by<select name="sort">${[{ value: 'recommended', label: 'Today’s picks' }, { value: 'price-low', label: 'Price: low to high' }, { value: 'price-high', label: 'Price: high to low' }, { value: 'name', label: 'Name: A to Z' }].map(option => `<option value="${option.value}" ${option.value === state.sort ? 'selected' : ''}>${option.label}</option>`).join('')}</select></label><label class="saved-filter"><input type="checkbox" name="favorites" ${state.favoritesOnly ? 'checked' : ''}>Only show saved meals</label><button type="submit" class="primary-button">Show meals</button></form>`); }
function openDeliveryDetails() { openAddresses(); }
function openAddresses() {
  openDialog('Delivery address', `<div class="address-list">${state.addresses.map(address => `<div class="saved-address ${address.id === state.selectedAddress ? 'selected' : ''}"><button class="address-choice" data-action="select-address" data-address="${escapeHTML(address.id)}">${icon('pin')}<span><strong>${escapeHTML(address.label || 'Other')}</strong><small>${escapeHTML(address.street)}<br>${escapeHTML(address.barangay)}, ${escapeHTML(address.city)}</small></span>${address.id === state.selectedAddress ? icon('check') : ''}</button><button class="icon-button" data-action="delete-address" data-address="${escapeHTML(address.id)}" aria-label="Delete ${escapeHTML(address.label || 'address')}">${icon('trash')}</button></div>`).join('')}</div>${state.addresses.length ? '' : '<p class="settings-note">Where would you like your food delivered? Save an address for a quicker checkout.</p>'}<button class="primary-button" data-action="new-address">${icon('plus')} Add a new address</button>`);
}
function newAddress() {
  openDialog('Add an address', `<form id="delivery-form" novalidate><label class="filter-option">Save as<select name="label"><option>Home</option><option>Work</option><option>Other</option></select></label>${checkoutFields.slice(2).map(field => fieldMarkup(field, 'address-')).join('')}<label class="field" for="address-notes">Landmark or rider instructions<textarea name="notes" id="address-notes" maxlength="300" placeholder="Building, gate, or nearby landmark">${escapeHTML(state.customer.notes || '')}</textarea></label><p class="form-message" id="form-message" role="alert"></p><button class="primary-button" type="submit">Save address</button></form>`);
}
function captureCustomer(form) { for (const [key, value] of new FormData(form)) if (['name', 'phone', 'street', 'barangay', 'city', 'notes', 'payment'].includes(key)) state.customer[key] = String(value).trim(); save(); }
function validateForm(form) {
  const invalid = [...form.querySelectorAll('input[required]')].filter(field => !validateField(field));
  const message = form.querySelector('#form-message'); if (message) message.textContent = invalid.length ? 'Please check the highlighted details before continuing.' : '';
  if (invalid.length) { invalid[0].focus(); invalid[0].scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  return !invalid.length;
}
document.addEventListener('pointerdown', () => { document.documentElement.dataset.input = 'pointer'; }, true);
document.addEventListener('keydown', event => {
  if (!event.ctrlKey && !event.metaKey && !event.altKey) document.documentElement.dataset.input = 'keyboard';
}, true);

document.addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return;
  if (button.dataset.page) { navigate(button.dataset.page); return; }
  if (button.dataset.category) { state.category = button.dataset.category; content.innerHTML = state.page === 'home' ? renderHome() : renderExplore(); renderResults(); animateContent(); return; }
  const id = button.dataset.id;
  switch (button.dataset.action) {
    case 'back': navigate(state.page === 'checkout' ? 'cart' : state.page === 'success' ? 'orders' : 'home'); break;
    case 'add': changeQuantity(id, 1); notify(`${findMeal(id).name} added to cart`); break;
    case 'increase': changeQuantity(id, 1); break;
    case 'decrease': changeQuantity(id, -1); break;
    case 'remove': delete state.cart[id]; save(); content.innerHTML = renderCart(); updateCartBadge(); notify(`${findMeal(id).name} removed`); break;
    case 'favorite': { const saved = state.favorites.includes(id); state.favorites = saved ? state.favorites.filter(favorite => favorite !== id) : [...state.favorites, id]; save(); button.classList.toggle('saved', !saved); button.setAttribute('aria-pressed', String(!saved)); if (state.favoritesOnly) renderResults(); notify(saved ? 'Meal removed from favorites' : 'Meal saved to favorites'); break; }
    case 'detail': { const meal = findMeal(id); openDialog(meal.name, `<img class="detail-photo" src="${imagePath(meal)}" alt="${meal.name}"><p class="detail-description">${meal.description}</p>${tags(meal)}<span class="detail-price">${money(meal.price)}</span><button class="primary-button" data-action="detail-add" data-id="${meal.id}">Add to Cart</button>`); break; }
    case 'detail-add': changeQuantity(id, 1); closeDialog(); notify(`${findMeal(id).name} added to cart`); break;
    case 'settings': openSettings(); break;
    case 'filters': openFilters(); break;
    case 'close': closeDialog(); break;
    case 'clear-filters': state.query = ''; state.category = 'All'; state.favoritesOnly = false; state.sort = 'recommended'; render(); break;
    case 'saved': state.favoritesOnly = true; state.category = 'All'; state.query = ''; navigate('explore'); break;
    case 'delivery-details': openDeliveryDetails(); break;
    case 'addresses': openAddresses(); break;
    case 'new-address': newAddress(); break;
    case 'select-address': {
      const address = state.addresses.find(address => address.id === button.dataset.address);
      if (address) { state.selectedAddress = address.id; Object.assign(state.customer, { street: address.street, barangay: address.barangay, city: address.city, notes: address.notes || '' }); state.fulfillment = 'delivery'; save(); closeDialog(); render(); notify(`${address.label} address selected`); }
      break;
    }
    case 'delete-address': state.addresses = state.addresses.filter(address => address.id !== button.dataset.address); if (state.selectedAddress === button.dataset.address) { state.selectedAddress = ''; Object.assign(state.customer, { street: '', barangay: '', city: '', notes: '' }); } save(); render(); openAddresses(); break;
    case 'fulfillment': state.fulfillment = button.dataset.mode === 'pickup' ? 'pickup' : 'delivery'; save(); render(); break;
    case 'fill-demo': { const sample = { name: 'Sample Customer', phone: '09000000000', street: '123 Sample Street', barangay: 'Sample Barangay', city: 'Quezon City', notes: '' }; for (const [key, value] of Object.entries(sample)) { const input = document.querySelector(`#checkout-form [name="${key}"]`); if (input) { input.value = value; if (input.required) validateField(input); } } captureCustomer(document.querySelector('#checkout-form')); notify('Details filled. You can edit any field.'); break; }
    case 'order-detail': { const order = state.orders.find(order => order.id === button.dataset.order); if (order) openDialog('Order details', orderCard(order, true)); break; }
    case 'demo-reset': openDialog('Reset app data?', `<p class="settings-note">This clears saved favorites, addresses, contact details, and orders, and restores the starter cart.</p><button class="primary-button" data-action="confirm-reset">Reset app data</button><button class="text-button" style="margin:6px auto" data-action="close">Keep my data</button>`); break;
    case 'confirm-reset': Object.assign(state, { cart: defaultCart(), favorites: [], orders: [], customer: {}, addresses: [], selectedAddress: '', fulfillment: 'delivery', promo: '', query: '', category: 'All', favoritesOnly: false, sort: 'recommended', latestOrder: null }); save(); closeDialog(); navigate('home'); notify('Ready for a fresh start.'); break;
    case 'about': openDialog('Conscious Kain', `<p class="detail-description">Filipino favorites. Familiar flavors. Food that feels like home.</p><p class="settings-note">Meal photography from TheMealDB.</p>`); break;
  }
});
document.addEventListener('input', event => {
  const target = event.target;
  if (target.id === 'meal-search') { state.query = target.value; renderResults(); }
  const form = target.closest('#checkout-form, #delivery-form');
  if (form) { if (form.id === 'checkout-form') captureCustomer(form); if (target.getAttribute('aria-invalid') === 'true' && target.required) validateField(target); }
});
document.addEventListener('focusout', event => { if (event.target.matches('#checkout-form input[required], #delivery-form input[required]')) validateField(event.target); });
document.addEventListener('submit', event => {
  const form = event.target; if (!['promo-form', 'checkout-form', 'filter-form', 'delivery-form'].includes(form.id)) return; event.preventDefault();
  if (form.id === 'promo-form') {
    const code = new FormData(form).get('promo').trim().toUpperCase();
    if (code === 'KAIN10') { state.promo = code; save(); content.innerHTML = renderCart(); notify('Promo applied. 10% off your meals!'); }
    else if (!code) { state.promo = ''; save(); content.innerHTML = renderCart(); notify('Promo cleared'); }
    else document.querySelector('#promo-feedback').textContent = 'That code isn’t available. Try KAIN10.';
  }
  if (form.id === 'filter-form') { const data = new FormData(form); state.category = data.get('category'); state.sort = data.get('sort'); state.favoritesOnly = data.has('favorites'); closeDialog(); render(); }
  if (form.id === 'delivery-form') {
    if (!validateForm(form)) return;
    const data = Object.fromEntries(new FormData(form));
    const address = { id: `address-${Date.now()}`, label: data.label, street: data.street.trim(), barangay: data.barangay.trim(), city: data.city.trim(), notes: data.notes.trim() };
    state.addresses.push(address); state.addresses = state.addresses.slice(-10); state.selectedAddress = address.id;
    Object.assign(state.customer, { street: address.street, barangay: address.barangay, city: address.city, notes: address.notes });
    state.fulfillment = 'delivery'; save(); closeDialog(); render(); notify('Address saved');
  }
  if (form.id === 'checkout-form') {
    if (!count()) { navigate('cart'); return; } if (!validateForm(form)) return; captureCustomer(form);
    const order = { id: `CK-${Date.now().toString(36).toUpperCase()}`, date: new Date().toISOString(), fulfillment: state.fulfillment, items: Object.entries(state.cart).map(([id, quantity]) => ({ id, quantity })), ...totals(), customer: { ...state.customer, payment: new FormData(form).get('payment') || 'cod' } };
    state.orders.unshift(order); state.orders = state.orders.slice(0, 20); state.latestOrder = order; state.cart = {}; state.promo = ''; save(); navigate('success');
  }
});
dialog.addEventListener('click', event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDialog(); } });
dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(); });
window.addEventListener('resize', () => { if (dialog.open) syncDialog(); });
document.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key === ',') { event.preventDefault(); openSettings(); } });
document.addEventListener('error', event => { if (event.target instanceof HTMLImageElement && event.target.src.includes('/assets/')) { event.target.alt = 'Meal photo unavailable'; event.target.style.background = '#e5f0d7'; } }, true);
loadSaved(); render();
if (storageWarning) notify('Saved data could not be read. Starting with a fresh cart.');
