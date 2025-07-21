// Initialize EmailJS with enhanced security
(function () {
  emailjs.init({
    publicKey: "XMPN1BECultZ3Fyrv",
    blockHeadless: true,
    limitRate: {
      id: 'app',
      throttle: 10000
    }
  });
})();

// DOM Elements
const contactForm = document.getElementById('contactForm');
const statusMessage = document.getElementById('statusMessage');
const authButton = document.getElementById('authButton');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const authModal = document.getElementById('authModal');
const searchInput = document.getElementById('searchInput');
const logoutBtn = document.getElementById('logoutBtn');
const userGreeting = document.getElementById('userGreeting');

// Click counter for protected actions
let protectedClickCount = 0;
const MAX_CLICKS_BEFORE_REMINDER = 5;

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
  if (contactForm) contactForm.addEventListener('submit', sendMail);
  if (authButton) authButton.addEventListener('click', openAuthModal);
  if (loginBtn) loginBtn.addEventListener('click', handleLogin);
  if (registerBtn) registerBtn.addEventListener('click', handleRegister);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeAuthModal);
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  if (searchInput) searchInput.addEventListener('keyup', searchResources);

  // Track protected clicks
  document.addEventListener('click', function(e) {
    const protectedElement = e.target.closest('.protected-action');
    if (protectedElement && !localStorage.getItem('loggedInUser')) {
      protectedClickCount++;
      if (protectedClickCount >= MAX_CLICKS_BEFORE_REMINDER) {
        showReminderToast();
        protectedClickCount = 0;
      }
    }
  });

  // Initialize UI and check auth status
  updateAuthUI();
  setupExternalLinks();
  setupCardAnimations();
}

// Contact Form Function
function sendMail(event) {
  event.preventDefault();

  const serviceID = 'service_t5qcgjv';
  const adminTemplateID = 'template_f1tvom3';
  const userReplyTemplateID = 'template_qawufof';

  const params = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    subject: document.getElementById('subject').value.trim(),
    message: document.getElementById('message').value.trim(),
    logo_url: "https://i.imgur.com/31ZeO6z.jpeg",
    reply_to: document.getElementById('email').value.trim(),
    date: new Date().toLocaleString()
  };

  // Enhanced validation
  if (!validateContactForm(params)) return;

  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;
  submitBtn.innerHTML = '<span class="spinner"></span> Sending...';
  submitBtn.disabled = true;

  // Send emails
  sendAdminEmail(params)
    .then(() => sendUserConfirmation(params))
    .then(() => handleSendSuccess(submitBtn, originalBtnText))
    .catch(error => handleSendError(error, submitBtn, originalBtnText));
}

function validateContactForm(params) {
  if (!params.name || !params.email || !params.subject || !params.message) {
    showStatusMessage('Please fill in all required fields', 'error');
    return false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(params.email)) {
    showStatusMessage('Please enter a valid email address', 'error');
    return false;
  }

  if (params.message.length < 10) {
    showStatusMessage('Message should be at least 10 characters', 'error');
    return false;
  }

  return true;
}

async function sendAdminEmail(params) {
  return emailjs.send('service_t5qcgjv', 'template_f1tvom3', params);
}

async function sendUserConfirmation(params) {
  return emailjs.send('service_t5qcgjv', 'template_qawufof', params);
}

function handleSendSuccess(submitBtn, originalBtnText) {
  showStatusMessage('✅ Message sent! You\'ll get a confirmation email shortly.', 'success');
  contactForm.reset();
  submitBtn.textContent = originalBtnText;
  submitBtn.disabled = false;
  
  // Track successful submission
  if (typeof gtag !== 'undefined') {
    gtag('event', 'contact_form_submission', {
      'event_category': 'engagement',
      'event_label': 'Successful Contact Form Submission'
    });
  }
}

function handleSendError(error, submitBtn, originalBtnText) {
  console.error('EmailJS Error:', error);
  showStatusMessage('❌ Failed to send message. Please try again later.', 'error');
  submitBtn.textContent = originalBtnText;
  submitBtn.disabled = false;
  
  // Track failed submission
  if (typeof gtag !== 'undefined') {
    gtag('event', 'contact_form_error', {
      'event_category': 'engagement',
      'event_label': 'Failed Contact Form Submission'
    });
  }
}

// Auth Functions
function openAuthModal() {
  authModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  document.getElementById('authEmail').focus();
  document.getElementById('authForm').reset();
  document.getElementById('authError').textContent = '';
}

function closeAuthModal() {
  authModal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

function handleLogin() {
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  const authError = document.getElementById('authError');
  
  if (!validateAuthInput(email, password, authError)) return;

  const stored = JSON.parse(localStorage.getItem('users') || '{}');
  const demoAccounts = {
    'admin@freefinder.com': 'admin123',
    ...stored
  };

  if (demoAccounts[email] && demoAccounts[email] === password) {
    handleSuccessfulLogin(email);
  } else {
    authError.textContent = 'Invalid email or password';
  }
}

function handleRegister() {
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  const passwordConfirm = document.getElementById('authPasswordConfirm').value;
  const name = document.getElementById('authName').value.trim();
  const authError = document.getElementById('authError');

  if (!validateRegistration(email, password, passwordConfirm, authError)) return;

  let users = JSON.parse(localStorage.getItem('users') || '{}');
  if (users[email]) {
    authError.textContent = 'Email already registered';
    return;
  }

  users[email] = {
    password: password,
    name: name || email.split('@')[0],
    registered: new Date().toISOString()
  };

  localStorage.setItem('users', JSON.stringify(users));
  handleSuccessfulLogin(email, name);
}

function validateAuthInput(email, password, errorElement) {
  if (!email || !password) {
    errorElement.textContent = 'Please fill in both fields';
    return false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errorElement.textContent = 'Please enter a valid email address';
    return false;
  }

  return true;
}

function validateRegistration(email, password, passwordConfirm, errorElement) {
  if (!validateAuthInput(email, password, errorElement)) return false;

  if (password.length < 6) {
    errorElement.textContent = 'Password must be at least 6 characters';
    return false;
  }

  if (password !== passwordConfirm) {
    errorElement.textContent = 'Passwords do not match';
    return false;
  }

  return true;
}

function handleSuccessfulLogin(email, name = '') {
  localStorage.setItem('loggedInUser', JSON.stringify({
    email: email,
    name: name || email.split('@')[0]
  }));
  
  updateAuthUI();
  showToast('✅ Login successful!', 'success');
  closeAuthModal();
  
  if (window.location.pathname.includes('contact.html')) {
    window.location.reload();
  }
}

function handleLogout() {
  localStorage.removeItem('loggedInUser');
  updateAuthUI();
  showToast('👋 You have been logged out', 'info');
  
  if (window.location.pathname.includes('contact.html')) {
    setTimeout(openAuthModal, 1000);
  }
}

function updateAuthUI() {
  const user = JSON.parse(localStorage.getItem('loggedInUser') || null);
  
  if (user) {
    if (authButton) authButton.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'block';
    if (userGreeting) {
      userGreeting.textContent = `Welcome, ${user.name || user.email.split('@')[0]}`;
      userGreeting.style.display = 'block';
    }
  } else {
    if (authButton) authButton.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (userGreeting) userGreeting.style.display = 'none';
  }
}

// Reminder System
function showReminderToast() {
  const toast = document.createElement('div');
  toast.className = 'reminder-toast';
  toast.innerHTML = `
    <p>Want full access? <button id="reminderLoginBtn">Login</button> or continue as guest</p>
    <button class="toast-close">&times;</button>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 10);
  
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  });
  
  document.getElementById('reminderLoginBtn').addEventListener('click', () => {
    openAuthModal();
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  });
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 8000);
}

// Search Functionality
function searchResources() {
  const input = searchInput.value.toLowerCase().trim();
  const cards = document.querySelectorAll('.category-card');
  const resultsContainer = document.getElementById('searchResults');
  resultsContainer.innerHTML = '';

  if (!input || input.length < 2) {
    resultsContainer.style.display = 'none';
    return;
  }

  let found = false;
  resultsContainer.style.display = 'block';

  cards.forEach(card => {
    const label = card.querySelector('p').textContent.toLowerCase();
    const description = card.dataset.description ? card.dataset.description.toLowerCase() : '';
    
    if (label.includes(input) || description.includes(input)) {
      found = true;
      const clone = card.cloneNode(true);
      clone.classList.add('search-result-item');
      resultsContainer.appendChild(clone);
    }
  });

  if (!found) {
    resultsContainer.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <p>No results found for "${input}"</p>
        <p class="suggestions">Try different keywords</p>
      </div>
    `;
  }
}

// Helper Functions
function showStatusMessage(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = type;
  statusMessage.style.display = 'block';
  statusMessage.style.opacity = 1;
  
  setTimeout(() => {
    statusMessage.style.opacity = 0;
    setTimeout(() => {
      statusMessage.style.display = 'none';
    }, 300);
  }, 5000);
}

function showToast(message, type) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }, 100);
}

function setupExternalLinks() {
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', function(e) {
      if (!this.href) return;
      
      e.preventDefault();
      
      const modal = document.createElement('div');
      modal.className = 'external-link-modal';
      modal.innerHTML = `
        <div class="modal-content">
          <h3>Leaving Free Finder</h3>
          <p>You are about to visit:</p>
          <p class="link-preview">${this.href.replace(/^https?:\/\//, '')}</p>
          <div class="modal-buttons">
            <button class="cancel-btn">Cancel</button>
            <button class="confirm-btn">Continue</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
      modal.querySelector('.confirm-btn').addEventListener('click', () => {
        window.open(this.href, '_blank');
        modal.remove();
      });
    });
  });
}

function setupCardAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.category-card').forEach(card => {
    observer.observe(card);
  });
}
// Initialize EmailJS with enhanced security
(function () {
  emailjs.init({
    publicKey: "XMPN1BECultZ3Fyrv",
    blockHeadless: true,
    limitRate: {
      id: 'app',
      throttle: 10000
    }
  });
})();


// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  initializeEventListeners();
  updateAuthUI();
  setupExternalLinks();
  setupCardAnimations();
  
  // Check if contact page requires auth
  if (window.location.pathname.includes('contact.html')) {
    checkAuthStatus();
  }
});

function initializeEventListeners() {
  // Form submissions
  if (contactForm) contactForm.addEventListener('submit', sendMail);
  if (authModal) {
    const authForm = document.getElementById('authForm');
    if (authForm) authForm.addEventListener('submit', function(e) {
      e.preventDefault();
      if (loginBtn.style.display !== 'none') {
        handleLogin();
      } else {
        handleRegister();
      }
    });
  }

  // Auth buttons
  if (authButton) authButton.addEventListener('click', openAuthModal);
  if (loginBtn) loginBtn.addEventListener('click', handleLogin);
  if (registerBtn) registerBtn.addEventListener('click', showRegistrationForm);
  if (registerSubmitBtn) registerSubmitBtn.addEventListener('click', handleRegister);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeAuthModal);
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  if (authToggle) authToggle.addEventListener('click', toggleAuthMode);

  // Search functionality
  if (searchInput) searchInput.addEventListener('keyup', searchResources);

  // Track protected clicks
  document.addEventListener('click', function(e) {
    const protectedElement = e.target.closest('.protected-action');
    if (protectedElement && !localStorage.getItem('loggedInUser')) {
      protectedClickCount++;
      if (protectedClickCount >= MAX_CLICKS_BEFORE_REMINDER) {
        showReminderToast();
        protectedClickCount = 0;
      }
    }
  });
}

// Contact Form Functions
function sendMail(event) {
  event.preventDefault();

  const serviceID = 'service_t5qcgjv';
  const adminTemplateID = 'template_f1tvom3';
  const userReplyTemplateID = 'template_qawufof';

  const params = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    subject: document.getElementById('subject').value.trim(),
    message: document.getElementById('message').value.trim(),
    logo_url: "https://i.imgur.com/31ZeO6z.jpeg",
    reply_to: document.getElementById('email').value.trim(),
    date: new Date().toLocaleString()
  };

  if (!validateContactForm(params)) return;

  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;
  submitBtn.innerHTML = '<span class="spinner"></span> Sending...';
  submitBtn.disabled = true;

  emailjs.send(serviceID, adminTemplateID, params)
    .then(() => emailjs.send(serviceID, userReplyTemplateID, params))
    .then(() => handleSendSuccess(submitBtn, originalBtnText))
    .catch(error => handleSendError(error, submitBtn, originalBtnText));
}

function validateContactForm(params) {
  if (!params.name || !params.email || !params.subject || !params.message) {
    showStatusMessage('Please fill in all required fields', 'error');
    return false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(params.email)) {
    showStatusMessage('Please enter a valid email address', 'error');
    return false;
  }

  if (params.message.length < 10) {
    showStatusMessage('Message should be at least 10 characters', 'error');
    return false;
  }

  return true;
}

function handleSendSuccess(submitBtn, originalBtnText) {
  showStatusMessage('✅ Message sent! You\'ll get a confirmation email shortly.', 'success');
  contactForm.reset();
  submitBtn.textContent = originalBtnText;
  submitBtn.disabled = false;
  
  if (typeof gtag !== 'undefined') {
    gtag('event', 'contact_form_submission', {
      'event_category': 'engagement',
      'event_label': 'Successful Contact Form Submission'
    });
  }
}

function handleSendError(error, submitBtn, originalBtnText) {
  console.error('EmailJS Error:', error);
  showStatusMessage('❌ Failed to send message. Please try again later.', 'error');
  submitBtn.textContent = originalBtnText;
  submitBtn.disabled = false;
  
  if (typeof gtag !== 'undefined') {
    gtag('event', 'contact_form_error', {
      'event_category': 'engagement',
      'event_label': 'Failed Contact Form Submission'
    });
  }
}

// Auth Functions
function openAuthModal() {
  authModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  document.getElementById('authEmail').focus();
  document.getElementById('authForm').reset();
  document.getElementById('authError').textContent = '';
}

function closeAuthModal() {
  authModal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

function showRegistrationForm() {
  openAuthModal();
  toggleAuthMode(true);
}

function toggleAuthMode(showRegister = false) {
  if (showRegister || loginBtn.style.display === 'none') {
    // Show login form
    loginBtn.style.display = 'block';
    registerSubmitBtn.style.display = 'none';
    authToggle.textContent = 'Need an account? Register';
    authTitle.textContent = 'Login to Your Account';
    passwordConfirmGroup.style.display = 'none';
    nameGroup.style.display = 'none';
  } else {
    // Show registration form
    loginBtn.style.display = 'none';
    registerSubmitBtn.style.display = 'block';
    authToggle.textContent = 'Already have an account? Login';
    authTitle.textContent = 'Create New Account';
    passwordConfirmGroup.style.display = 'block';
    nameGroup.style.display = 'block';
  }
  
  document.getElementById('authError').textContent = '';
}

function handleLogin() {
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  const authError = document.getElementById('authError');
  
  if (!validateAuthInput(email, password, authError)) return;

  const stored = JSON.parse(localStorage.getItem('users') || '{}');
  const demoAccounts = {
    'admin@freefinder.com': { password: 'admin123', name: 'Admin' },
    ...stored
  };

  if (demoAccounts[email] && demoAccounts[email].password === password) {
    handleSuccessfulAuth(email, demoAccounts[email].name);
  } else {
    authError.textContent = 'Invalid email or password';
  }
}

function handleRegister() {
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  const passwordConfirm = document.getElementById('authPasswordConfirm').value;
  const name = document.getElementById('authName').value.trim();
  const authError = document.getElementById('authError');

  if (!validateRegistration(email, password, passwordConfirm, authError)) return;

  let users = JSON.parse(localStorage.getItem('users') || '{}');
  if (users[email]) {
    authError.textContent = 'Email already registered';
    return;
  }

  users[email] = {
    password: password,
    name: name || email.split('@')[0],
    registered: new Date().toISOString()
  };

  localStorage.setItem('users', JSON.stringify(users));
  handleSuccessfulAuth(email, name);
}

function validateAuthInput(email, password, errorElement) {
  if (!email || !password) {
    errorElement.textContent = 'Please fill in both fields';
    return false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errorElement.textContent = 'Please enter a valid email address';
    return false;
  }

  return true;
}

function validateRegistration(email, password, passwordConfirm, errorElement) {
  if (!validateAuthInput(email, password, errorElement)) return false;

  if (password.length < 6) {
    errorElement.textContent = 'Password must be at least 6 characters';
    return false;
  }

  if (password !== passwordConfirm) {
    errorElement.textContent = 'Passwords do not match';
    return false;
  }

  return true;
}

function handleSuccessfulAuth(email, name = '') {
  localStorage.setItem('loggedInUser', JSON.stringify({
    email: email,
    name: name || email.split('@')[0]
  }));
  
  updateAuthUI();
  showToast('✅ Login successful!', 'success');
  closeAuthModal();
  
  if (window.location.pathname.includes('contact.html')) {
    window.location.reload();
  }
}

function handleLogout() {
  localStorage.removeItem('loggedInUser');
  updateAuthUI();
  showToast('👋 You have been logged out', 'info');
  
  if (window.location.pathname.includes('contact.html')) {
    setTimeout(openAuthModal, 1000);
  }
}

function checkAuthStatus() {
  if (!localStorage.getItem('loggedInUser')) {
    openAuthModal();
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.innerHTML = `
        <div class="auth-required">
          <h2>Please Login</h2>
          <p>You need to login to access this page</p>
        </div>
      `;
    }
  }
}

function updateAuthUI() {
  const user = JSON.parse(localStorage.getItem('loggedInUser') || null);
  
  if (user) {
    if (authButton) authButton.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'block';
    if (userGreeting) {
      userGreeting.textContent = `Welcome, ${user.name || user.email.split('@')[0]}`;
      userGreeting.style.display = 'block';
    }
  } else {
    if (authButton) authButton.style.display = 'block';
    if (registerBtn) registerBtn.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (userGreeting) userGreeting.style.display = 'none';
  }
}

// Reminder System
function showReminderToast() {
  const toast = document.createElement('div');
  toast.className = 'reminder-toast';
  toast.innerHTML = `
    <p>Want full access? <button id="reminderLoginBtn">Login/Register</button> or continue as guest</p>
    <button class="toast-close">&times;</button>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 10);
  
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  });
  
  document.getElementById('reminderLoginBtn').addEventListener('click', () => {
    openAuthModal();
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  });
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 8000);
}

// Search Functionality
function searchResources() {
  const input = searchInput.value.toLowerCase().trim();
  const cards = document.querySelectorAll('.category-card');
  const resultsContainer = document.getElementById('searchResults');
  resultsContainer.innerHTML = '';

  if (!input || input.length < 2) {
    resultsContainer.style.display = 'none';
    return;
  }

  let found = false;
  resultsContainer.style.display = 'block';

  cards.forEach(card => {
    const label = card.querySelector('p').textContent.toLowerCase();
    const description = card.dataset.description ? card.dataset.description.toLowerCase() : '';
    
    if (label.includes(input) || description.includes(input)) {
      found = true;
      const clone = card.cloneNode(true);
      clone.classList.add('search-result-item');
      resultsContainer.appendChild(clone);
    }
  });

  if (!found) {
    resultsContainer.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <p>No results found for "${input}"</p>
        <p class="suggestions">Try different keywords</p>
      </div>
    `;
  }
}

// UI Helper Functions
function showStatusMessage(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = type;
  statusMessage.style.display = 'block';
  statusMessage.style.opacity = 1;
  
  setTimeout(() => {
    statusMessage.style.opacity = 0;
    setTimeout(() => {
      statusMessage.style.display = 'none';
    }, 300);
  }, 5000);
}

function showToast(message, type) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }, 100);
}

function setupExternalLinks() {
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', function(e) {
      if (!this.href) return;
      
      e.preventDefault();
      
      const modal = document.createElement('div');
      modal.className = 'external-link-modal';
      modal.innerHTML = `
        <div class="modal-content">
          <h3>Leaving Free Finder</h3>
          <p>You are about to visit:</p>
          <p class="link-preview">${this.href.replace(/^https?:\/\//, '')}</p>
          <div class="modal-buttons">
            <button class="cancel-btn">Cancel</button>
            <button class="confirm-btn">Continue</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
      modal.querySelector('.confirm-btn').addEventListener('click', () => {
        window.open(this.href, '_blank');
        modal.remove();
      });
    });
  });
}

function setupCardAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.category-card').forEach(card => {
    observer.observe(card);
  });
}
/**
 * Free Finder Authentication System
 * Professional implementation with login, registration, and logout functionality
 * Includes form validation, error handling, and UI updates
 */

// Initialize EmailJS with enhanced security
(function () {
  emailjs.init({
    publicKey: "XMPN1BECultZ3Fyrv",
    blockHeadless: true,
    limitRate: {
      id: 'app',
      throttle: 10000
    }
  });
})();

// Configuration Constants
const CONFIG = {
  demoAccounts: {
    'admin@freefinder.com': {
      password: 'admin123',
      name: 'Admin',
      role: 'admin'
    },
    'user@freefinder.com': {
      password: 'user123',
      name: 'Demo User',
      role: 'user'
    }
  },
  maxClicksBeforeReminder: 5,
  minPasswordLength: 6,
  sessionTimeout: 30 // minutes
};

// DOM Elements
const elements = {
  contactForm: document.getElementById('contactForm'),
  statusMessage: document.getElementById('statusMessage'),
  authButton: document.getElementById('authButton'),
  loginBtn: document.getElementById('loginBtn'),
  registerBtn: document.getElementById('registerBtn'),
  registerSubmitBtn: document.getElementById('registerSubmitBtn'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  authModal: document.getElementById('authModal'),
  searchInput: document.getElementById('searchInput'),
  logoutBtn: document.getElementById('logoutBtn'),
  userGreeting: document.getElementById('userGreeting'),
  authForm: document.getElementById('authForm'),
  authEmail: document.getElementById('authEmail'),
  authPassword: document.getElementById('authPassword'),
  authPasswordConfirm: document.getElementById('authPasswordConfirm'),
  authName: document.getElementById('authName'),
  authError: document.getElementById('authError'),
  authTitle: document.getElementById('authTitle'),
  authToggle: document.getElementById('authToggle'),
  passwordConfirmGroup: document.getElementById('passwordConfirmGroup'),
  nameGroup: document.getElementById('nameGroup')
};



// Event Listeners
function initializeApp() {
  // Form submissions
  if (elements.contactForm) {
    elements.contactForm.addEventListener('submit', sendMail);
  }

  // Auth modal
  if (elements.authModal) {
    elements.authForm.addEventListener('submit', handleAuthSubmit);
    elements.closeModalBtn.addEventListener('click', closeAuthModal);
    elements.authToggle.addEventListener('click', toggleAuthMode);
  }

  // Protected click tracking
  document.addEventListener('click', trackProtectedClicks);

  // Initialize UI and check auth status
  updateAuthUI();
  setupExternalLinks();
  setupCardAnimations();
  checkSessionTimeout();

  // Load any saved users
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify({}));
  }
}

// Authentication Functions
function handleAuthSubmit(e) {
  e.preventDefault();
  
  const isLoginMode = elements.loginBtn.style.display !== 'none';
  if (isLoginMode) {
    handleLogin();
  } else {
    handleRegister();
  }
}

function handleLogin() {
  const email = elements.authEmail.value.trim();
  const password = elements.authPassword.value;
  
  if (!validateAuthInput(email, password)) return;

  const users = JSON.parse(localStorage.getItem('users'));
  const allAccounts = { ...CONFIG.demoAccounts, ...users };

  if (allAccounts[email] && allAccounts[email].password === password) {
    handleSuccessfulAuth(email, allAccounts[email].name, allAccounts[email].role);
  } else {
    showAuthError('Invalid email or password');
  }
}

function handleRegister() {
  const email = elements.authEmail.value.trim();
  const password = elements.authPassword.value;
  const passwordConfirm = elements.authPasswordConfirm.value;
  const name = elements.authName.value.trim();
  
  if (!validateRegistration(email, password, passwordConfirm, name)) return;

  const users = JSON.parse(localStorage.getItem('users'));
  
  if (users[email] || CONFIG.demoAccounts[email]) {
    showAuthError('Email already registered');
    return;
  }

  users[email] = {
    password: password,
    name: name || email.split('@')[0],
    registered: new Date().toISOString(),
    role: 'user'
  };

  localStorage.setItem('users', JSON.stringify(users));
  handleSuccessfulAuth(email, users[email].name, users[email].role);
}

function validateAuthInput(email, password) {
  if (!email || !password) {
    showAuthError('Please fill in both fields');
    return false;
  }

  if (!isValidEmail(email)) {
    showAuthError('Please enter a valid email address');
    return false;
  }

  return true;
}

function validateRegistration(email, password, passwordConfirm, name) {
  if (!validateAuthInput(email, password)) return false;

  if (password.length < CONFIG.minPasswordLength) {
    showAuthError(`Password must be at least ${CONFIG.minPasswordLength} characters`);
    return false;
  }

  if (password !== passwordConfirm) {
    showAuthError('Passwords do not match');
    return false;
  }

  if (!name.trim()) {
    showAuthError('Please enter your name');
    return false;
  }

  return true;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function handleSuccessfulAuth(email, name, role) {
  const userData = {
    email: email,
    name: name || email.split('@')[0],
    role: role || 'user',
    lastLogin: new Date().toISOString()
  };

  localStorage.setItem('loggedInUser', JSON.stringify(userData));
  resetSessionTimer();
  
  updateAuthUI();
  showToast(`✅ Welcome back, ${userData.name}!`, 'success');
  closeAuthModal();
  
  if (window.location.pathname.includes('contact.html')) {
    window.location.reload();
  }
}

function handleLogout() {
  const userName = getCurrentUser()?.name || 'User';
  localStorage.removeItem('loggedInUser');
  clearSessionTimer();
  
  updateAuthUI();
  showToast(`👋 Goodbye, ${userName}!`, 'info');
  
  if (window.location.pathname.includes('contact.html')) {
    setTimeout(openAuthModal, 1000);
  }
}

function getCurrentUser() {
  const user = localStorage.getItem('loggedInUser');
  return user ? JSON.parse(user) : null;
}

// Session Management
function resetSessionTimer() {
  clearSessionTimer();
  sessionTimer = setTimeout(() => {
    handleLogout();
    showToast('Your session has expired. Please login again.', 'warning');
  }, CONFIG.sessionTimeout * 60 * 1000);
}

function clearSessionTimer() {
  if (sessionTimer) {
    clearTimeout(sessionTimer);
    sessionTimer = null;
  }
}

function checkSessionTimeout() {
  const user = getCurrentUser();
  if (user?.lastLogin) {
    const lastLogin = new Date(user.lastLogin);
    const now = new Date();
    const diffMinutes = (now - lastLogin) / (1000 * 60);
    
    if (diffMinutes >= CONFIG.sessionTimeout) {
      handleLogout();
    } else {
      resetSessionTimer();
    }
  }
}

// UI Functions
function openAuthModal() {
  elements.authModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  elements.authEmail.focus();
  elements.authForm.reset();
  elements.authError.textContent = '';
  toggleAuthMode(false); // Default to login mode
}

function closeAuthModal() {
  elements.authModal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

function toggleAuthMode(showRegister = false) {
  const isLoginMode = !showRegister;
  
  elements.loginBtn.style.display = isLoginMode ? 'block' : 'none';
  elements.registerSubmitBtn.style.display = isLoginMode ? 'none' : 'block';
  elements.authToggle.textContent = isLoginMode ? 'Need an account? Register' : 'Already have an account? Login';
  elements.authTitle.textContent = isLoginMode ? 'Login to Your Account' : 'Create New Account';
  elements.passwordConfirmGroup.style.display = isLoginMode ? 'none' : 'block';
  elements.nameGroup.style.display = isLoginMode ? 'none' : 'block';
  
  elements.authError.textContent = '';
}

function updateAuthUI() {
  const user = getCurrentUser();
  
  if (user) {
    if (elements.authButton) elements.authButton.style.display = 'none';
    if (elements.logoutBtn) elements.logoutBtn.style.display = 'block';
    if (elements.userGreeting) {
      elements.userGreeting.textContent = `Welcome, ${user.name || user.email.split('@')[0]}`;
      elements.userGreeting.style.display = 'block';
    }
  } else {
    if (elements.authButton) elements.authButton.style.display = 'block';
    if (elements.logoutBtn) elements.logoutBtn.style.display = 'none';
    if (elements.userGreeting) elements.userGreeting.style.display = 'none';
  }
}

function showAuthError(message) {
  elements.authError.textContent = message;
  elements.authError.style.display = 'block';
  setTimeout(() => {
    elements.authError.style.opacity = '1';
  }, 10);
}

// Protected Actions Tracking
function trackProtectedClicks(e) {
  const protectedElement = e.target.closest('.protected-action');
  if (protectedElement && !getCurrentUser()) {
    protectedClickCount++;
    if (protectedClickCount >= CONFIG.maxClicksBeforeReminder) {
      showReminderToast();
      protectedClickCount = 0;
    }
  }
}

function showReminderToast() {
  const toast = document.createElement('div');
  toast.className = 'reminder-toast';
  toast.innerHTML = `
    <p>Want full access? <button id="reminderLoginBtn">Login/Register</button> or continue as guest</p>
    <button class="toast-close">&times;</button>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 10);
  
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });
  
  document.getElementById('reminderLoginBtn').addEventListener('click', () => {
    openAuthModal();
    toast.remove();
  });
  
  setTimeout(() => {
    toast.remove();
  }, 8000);
}

// Notification System
function showToast(message, type) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }, 100);
}

function showStatusMessage(message, type) {
  if (!elements.statusMessage) return;
  
  elements.statusMessage.textContent = message;
  elements.statusMessage.className = type;
  elements.statusMessage.style.display = 'block';
  
  setTimeout(() => {
    elements.statusMessage.style.display = 'none';
  }, 5000);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', initializeApp);

// Contact Form Functions (kept from original)
function sendMail(event) {
  event.preventDefault();

  const params = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    subject: document.getElementById('subject').value.trim(),
    message: document.getElementById('message').value.trim(),
    logo_url: "https://i.imgur.com/31ZeO6z.jpeg",
    reply_to: document.getElementById('email').value.trim(),
    date: new Date().toLocaleString()
  };

  if (!validateContactForm(params)) return;

  const submitBtn = elements.contactForm.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;
  submitBtn.innerHTML = '<span class="spinner"></span> Sending...';
  submitBtn.disabled = true;

  emailjs.send('service_t5qcgjv', 'template_f1tvom3', params)
    .then(() => emailjs.send('service_t5qcgjv', 'template_qawufof', params))
    .then(() => {
      showStatusMessage('✅ Message sent! You\'ll get a confirmation email shortly.', 'success');
      elements.contactForm.reset();
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    })
    .catch(error => {
      console.error('EmailJS Error:', error);
      showStatusMessage('❌ Failed to send message. Please try again later.', 'error');
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    });
}

function validateContactForm(params) {
  if (!params.name || !params.email || !params.subject || !params.message) {
    showStatusMessage('Please fill in all required fields', 'error');
    return false;
  }

  if (!isValidEmail(params.email)) {
    showStatusMessage('Please enter a valid email address', 'error');
    return false;
  }

  if (params.message.length < 10) {
    showStatusMessage('Message should be at least 10 characters', 'error');
    return false;
  }

  return true;
}

// Utility Functions
function setupExternalLinks() {
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', function(e) {
      if (!this.href) return;
      
      e.preventDefault();
      
      const modal = document.createElement('div');
      modal.className = 'external-link-modal';
      modal.innerHTML = `
        <div class="modal-content">
          <h3>Leaving Free Finder</h3>
          <p>You are about to visit:</p>
          <p class="link-preview">${this.href.replace(/^https?:\/\//, '')}</p>
          <div class="modal-buttons">
            <button class="cancel-btn">Cancel</button>
            <button class="confirm-btn">Continue</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
      modal.querySelector('.confirm-btn').addEventListener('click', () => {
        window.open(this.href, '_blank');
        modal.remove();
      });
    });
  });
}

function setupCardAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.category-card').forEach(card => {
    observer.observe(card);
  });
}