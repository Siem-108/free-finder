// Fixed Navigation System
document.addEventListener('DOMContentLoaded', function() {
  // Get all navigation elements
  const navItems = document.querySelectorAll('.nav-item');
  const activeClass = 'nav-active';
  
  // Set initial active item based on current page
  function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    navItems.forEach(item => {
      const itemPage = item.getAttribute('data-page');
      if (itemPage === currentPage) {
        item.classList.add(activeClass);
      } else {
        item.classList.remove(activeClass);
      }
    });
  }

  // Make navigation sticky/fixed
  function fixNavigation() {
    const nav = document.querySelector('.main-nav');
    if (nav) {
      nav.style.position = 'fixed';
      nav.style.top = '0';
      nav.style.width = '100%';
      nav.style.zIndex = '1000';
      nav.style.background = '#fff';
      nav.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
      
      // Add padding to body to compensate for fixed nav
      document.body.style.paddingTop = nav.offsetHeight + 'px';
    }
  }

  // Initialize
  setActiveNav();
  fixNavigation();

  // Update on resize
  window.addEventListener('resize', fixNavigation);
});
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




// Click counter for protected actions
let protectedClickCount = 0;
let sessionTimer = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
  // Form submissions
  if (elements.contactForm) {
    elements.contactForm.addEventListener('submit', handleFormSubmit);
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
  
  elements.statusMessage.innerHTML = message;
  elements.statusMessage.className = type;
  elements.statusMessage.style.display = 'block';
  
  // Auto-hide after 5 seconds (except for errors)
  if (type !== 'error') {
    setTimeout(() => {
      elements.statusMessage.style.display = 'none';
    }, 5000);
  }
}

// Contact Form Functions
async function handleFormSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = {
    name: form.querySelector('#name').value.trim(),
    email: form.querySelector('#email').value.trim(),
    subject: form.querySelector('#subject').value.trim(),
    message: form.querySelector('#message').value.trim(),
    logo_url: "https://i.imgur.com/31ZeO6z.jpeg",
    reply_to: form.querySelector('#email').value.trim(),
    date: new Date().toLocaleString(),
    user_agent: navigator.userAgent,
    page_url: window.location.href
  };

  if (!validateContactForm(formData)) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnState = {
    text: submitBtn.textContent,
    html: submitBtn.innerHTML
  };

  submitBtn.innerHTML = `
    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Sending...
  `;
  submitBtn.disabled = true;

  const emailTimeout = setTimeout(() => {
    showStatusMessage('The server is taking longer than expected. Please wait...', 'warning');
  }, 5000);

  try {
    await emailjs.send('service_t5qcgjv', 'template_f1tvom3', formData);
    await emailjs.send('service_t5qcgjv', 'template_qawufof', formData);
    
    clearTimeout(emailTimeout);
    showStatusMessage('✅ Message sent! Check your email for confirmation.', 'success');
    form.reset();
    
    if (typeof gtag !== 'undefined') {
      gtag('event', 'contact_form_submission', {
        'event_category': 'engagement',
        'event_label': 'Successful Contact Form Submission'
      });
    }
  } catch (error) {
    clearTimeout(emailTimeout);
    
    let errorMessage = '❌ Failed to send message. Please try again later.';
    if (error.status === 400) {
      errorMessage = '❌ Invalid form data. Please check your inputs.';
    } else if (error.status === 429) {
      errorMessage = '❌ Too many attempts. Please wait before trying again.';
    }
    
    showStatusMessage(errorMessage, 'error');
    
    if (typeof gtag !== 'undefined') {
      gtag('event', 'contact_form_error', {
        'event_category': 'engagement',
        'event_label': `Failed Submission: ${error.status || 'Unknown Error'}`
      });
    }
  } finally {
    submitBtn.textContent = originalBtnState.text;
    submitBtn.innerHTML = originalBtnState.html;
    submitBtn.disabled = false;
  }
}

function validateContactForm(formData) {
  const errors = [];
  
  if (!formData.name) errors.push('Name is required');
  if (!formData.email) errors.push('Email is required');
  if (!formData.subject) errors.push('Subject is required');
  if (!formData.message) errors.push('Message is required');
  
  if (formData.email && !isValidEmail(formData.email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (formData.message && formData.message.length < 10) {
    errors.push('Message should be at least 10 characters');
  }
  
  if (errors.length > 0) {
    showStatusMessage(errors.join('<br>'), 'error');
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

// Ensure EmailJS is loaded
if (typeof emailjs === 'undefined') {
  console.error('EmailJS is not loaded!');
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
  script.onload = function() {
    emailjs.init({
      publicKey: "XMPN1BECultZ3Fyrv",
      blockHeadless: true,
      limitRate: {
        id: 'app',
        throttle: 10000
      }
    });
  };
  document.head.appendChild(script);
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



// Initialize the application with enhanced checks
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize elements that exist on the current page
  initializeApp();
  
  // Add event listeners for elements that exist
  if (elements.authButton) elements.authButton.addEventListener('click', openAuthModal);
  if (elements.logoutBtn) elements.logoutBtn.addEventListener('click', handleLogout);
  
  // Check if we're on a protected page
  if (document.querySelector('.protected-content') && !getCurrentUser()) {
    showToast('🔒 Please login to access all features', 'info');
  }
});

function initializeApp() {
  // Form submissions (if on contact page)
  if (elements.contactForm) {
    elements.contactForm.addEventListener('submit', handleFormSubmit);
  }

  // Auth modal (if exists on page)
  if (elements.authModal) {
    setupAuthModal();
  }

  // Protected click tracking (all pages)
  document.addEventListener('click', trackProtectedClicks);

  // Initialize UI and check auth status (all pages)
  updateAuthUI();
  setupExternalLinks();
  setupCardAnimations();
  checkSessionTimeout();

  // Load any saved users (all pages)
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify({}));
  }
}

function setupAuthModal() {
  elements.authForm.addEventListener('submit', handleAuthSubmit);
  elements.closeModalBtn.addEventListener('click', closeAuthModal);
  elements.authToggle.addEventListener('click', toggleAuthMode);
  
  // Password strength indicator
  if (elements.authPassword) {
    elements.authPassword.addEventListener('input', updatePasswordStrength);
  }
  
  // Remember me functionality
  if (elements.rememberMe) {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      elements.authEmail.value = rememberedEmail;
      elements.rememberMe.checked = true;
    }
  }
}

// Enhanced Authentication Functions
function handleAuthSubmit(e) {
  e.preventDefault();
  
  if (currentAuthMode === 'login') {
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
    // Remember email if checkbox is checked
    if (elements.rememberMe && elements.rememberMe.checked) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    
    handleSuccessfulAuth(email, allAccounts[email].name, allAccounts[email].role);
  } else {
    showAuthError('Invalid email or password');
    shakeAuthForm();
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
    shakeAuthForm();
    return;
  }

  users[email] = {
    password: password,
    name: name || email.split('@')[0],
    registered: new Date().toISOString(),
    role: 'user',
    preferences: {}
  };

  localStorage.setItem('users', JSON.stringify(users));
  handleSuccessfulAuth(email, users[email].name, users[email].role);
}

// Enhanced Validation
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

  // Enhanced password validation
  const passwordErrors = checkPasswordStrength(password);
  if (passwordErrors.length > 0) {
    showAuthError(passwordErrors.join('<br>'));
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

function checkPasswordStrength(password) {
  const errors = [];
  const requirements = CONFIG.passwordRequirements;

  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters`);
  }
  if (requirements.requireUpper && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (requirements.requireNumber && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (requirements.requireSpecial && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return errors;
}

function updatePasswordStrength() {
  if (!elements.passwordStrength) return;
  
  const password = elements.authPassword.value;
  let strength = 0;
  
  // Length check
  if (password.length >= CONFIG.passwordRequirements.minLength) strength++;
  // Uppercase check
  if (/[A-Z]/.test(password)) strength++;
  // Number check
  if (/[0-9]/.test(password)) strength++;
  // Special char check
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  elements.passwordStrength.innerHTML = '';
  const strengthText = ['Very Weak', 'Weak', 'Moderate', 'Strong', 'Very Strong'][strength];
  const strengthClass = ['very-weak', 'weak', 'moderate', 'strong', 'very-strong'][strength];
  
  if (password.length > 0) {
    elements.passwordStrength.innerHTML = `
      <div class="strength-meter ${strengthClass}">
        <span class="strength-text">Password Strength: ${strengthText}</span>
        <div class="strength-bars">
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
        </div>
      </div>
    `;
  }
}

// Enhanced UI Functions
function openAuthModal(mode = 'login') {
  currentAuthMode = mode;
  elements.authModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  elements.authEmail.focus();
  elements.authForm.reset();
  elements.authError.textContent = '';
  
  // Reset to appropriate mode
  toggleAuthMode(mode === 'login');
  
  // Add animation class
  elements.authModal.querySelector('.auth-modal-content').classList.add('modal-open');
}

function closeAuthModal() {
  const modalContent = elements.authModal.querySelector('.auth-modal-content');
  modalContent.classList.remove('modal-open');
  modalContent.classList.add('modal-close');
  
  setTimeout(() => {
    elements.authModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    modalContent.classList.remove('modal-close');
  }, 300);
}

function toggleAuthMode(showLogin = true) {
  currentAuthMode = showLogin ? 'login' : 'register';
  
  elements.loginBtn.style.display = showLogin ? 'block' : 'none';
  elements.registerSubmitBtn.style.display = showLogin ? 'none' : 'block';
  elements.authToggle.innerHTML = showLogin 
    ? 'Need an account? <span class="auth-mode-link">Register</span>' 
    : 'Already have an account? <span class="auth-mode-link">Login</span>';
  elements.authTitle.textContent = showLogin ? 'Login to Your Account' : 'Create New Account';
  elements.passwordConfirmGroup.style.display = showLogin ? 'none' : 'block';
  elements.nameGroup.style.display = showLogin ? 'none' : 'block';
  
  // Update password strength visibility
  if (elements.passwordStrength) {
    elements.passwordStrength.style.display = showLogin ? 'none' : 'block';
  }
  
  elements.authError.textContent = '';
}

function shakeAuthForm() {
  const form = elements.authForm;
  form.classList.add('shake');
  setTimeout(() => {
    form.classList.remove('shake');
  }, 500);
}

function updateAuthUI() {
  const user = getCurrentUser();
  
  if (user) {
    if (elements.authButton) elements.authButton.style.display = 'none';
    if (elements.logoutBtn) elements.logoutBtn.style.display = 'block';
    if (elements.userGreeting) {
      elements.userGreeting.innerHTML = `
        <span class="welcome-text">Welcome,</span>
        <span class="user-name">${user.name || user.email.split('@')[0]}</span>
        ${user.role === 'admin' ? '<span class="user-badge admin">Admin</span>' : ''}
      `;
      elements.userGreeting.style.display = 'flex';
    }
  } else {
    if (elements.authButton) elements.authButton.style.display = 'block';
    if (elements.logoutBtn) elements.logoutBtn.style.display = 'none';
    if (elements.userGreeting) elements.userGreeting.style.display = 'none';
  }
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
  minPasswordLength: 8,
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



// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  
  // Fix for close button - event delegation approach
  document.addEventListener('click', function(e) {
    if (e.target.id === 'closeModalBtn' || 
        e.target.classList.contains('close-modal-btn') ||
        (e.target === document.getElementById('authModal') && e.target !== document.querySelector('.auth-modal-content'))) {
      e.preventDefault();
      closeAuthModal();
    }
  });
});

function initializeApp() {
  if (elements.contactForm) {
    elements.contactForm.addEventListener('submit', handleFormSubmit);
  }

  if (elements.authModal) {
    setupAuthModal();
  }

  document.addEventListener('click', trackProtectedClicks);
  updateAuthUI();
  setupExternalLinks();
  setupCardAnimations();
  checkSessionTimeout();

  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify({}));
  }
}

function setupAuthModal() {
  elements.authForm.addEventListener('submit', handleAuthSubmit);
  elements.authToggle.addEventListener('click', toggleAuthMode);
  
  // Ensure modal is properly initialized
  elements.authModal.style.display = 'none';
  elements.authModal.style.zIndex = '10000';
}

function closeAuthModal() {
  const modalContent = elements.authModal.querySelector('.auth-modal-content');
  modalContent.classList.add('modal-close');
  
  setTimeout(() => {
    elements.authModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    modalContent.classList.remove('modal-close');
  }, 300);
}

function openAuthModal(mode = 'login') {
  currentAuthMode = mode;
  elements.authModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  elements.authEmail.focus();
  elements.authForm.reset();
  elements.authError.textContent = '';
  toggleAuthMode(mode === 'login');
  
  const modalContent = elements.authModal.querySelector('.auth-modal-content');
  modalContent.classList.remove('modal-close');
  modalContent.classList.add('modal-open');
}

// Fix for Login Modal Close Button
document.addEventListener('DOMContentLoaded', function() {
  // Get the close button and modal
  const closeButton = document.getElementById('closeModalBtn');
  const loginModal = document.getElementById('authModal');

  // Only proceed if elements exist
  if (closeButton && loginModal) {
    // Add click event to close button
    closeButton.addEventListener('click', function(e) {
      e.preventDefault(); // Prevent default behavior
      loginModal.style.display = 'none'; // Hide modal
      document.body.style.overflow = 'auto'; // Re-enable scrolling
    });

    // Also close when clicking outside modal content
    loginModal.addEventListener('click', function(e) {
      if (e.target === loginModal) { // Check if clicked on modal background
        loginModal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    });
  } else {
    console.log('Login modal elements not found');
  }
});

// Make sure open function works (if you're using one)
function openLoginModal() {
  const loginModal = document.getElementById('authModal');
  if (loginModal) {
    loginModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}
// Navigation Alignment Fix
document.addEventListener('DOMContentLoaded', function() {
  // Cache navigation elements
  const navItems = document.querySelectorAll('.nav-item');
  const navContainer = document.querySelector('.nav-container');
  
  if (!navItems.length || !navContainer) return;

  // Function to equalize all nav items
  function equalizeNavItems() {
    // Find the widest nav item
    let maxWidth = 0;
    navItems.forEach(item => {
      item.style.width = 'auto'; // Reset to natural width
      maxWidth = Math.max(maxWidth, item.offsetWidth);
    });

    // Apply consistent width to all items
    navItems.forEach(item => {
      item.style.width = `${maxWidth}px`;
      item.style.textAlign = 'center';
      item.style.padding = '12px 0'; // Consistent padding
    });

    // Center the nav container
    navContainer.style.justifyContent = 'center';
  }

  // Run on load and resize
  equalizeNavItems();
  window.addEventListener('resize', equalizeNavItems);
});