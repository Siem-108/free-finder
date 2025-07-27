/**
 * FREE FINDER - OPTIMIZED JAVASCRIPT
 * Professional, modular, and maintainable code
 */

// ===== CONFIGURATION =====
const CONFIG = {
  emailjs: {
    publicKey: "XMPN1BECultZ3Fyrv",
    serviceId: "service_meis",
    templateId: "template_contact"
  },
  storage: {
    keys: {
      users: 'freefinder_users',
      currentUser: 'freefinder_current_user',
      cartCount: 'freefinder_cart_count'
    }
  },
  security: {
    maxLoginAttempts: 3,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    rateLimitDelay: 10000 // 10 seconds
  }
};

// ===== UTILITY FUNCTIONS =====
const Utils = {
  // DOM element selector with caching
  getElement: (selector, cache = true) => {
    if (cache && Utils.elementCache?.[selector]) {
      return Utils.elementCache[selector];
    }
    const element = document.querySelector(selector);
    if (cache) {
      Utils.elementCache = Utils.elementCache || {};
      Utils.elementCache[selector] = element;
    }
    return element;
  },

  // Get multiple elements
  getElements: (selector) => document.querySelectorAll(selector),

  // Show/hide elements
  show: (element) => element && (element.style.display = ''),
  hide: (element) => element && (element.style.display = 'none'),

  // Add/remove classes
  addClass: (element, className) => element?.classList.add(className),
  removeClass: (element, className) => element?.classList.remove(className),
  toggleClass: (element, className) => element?.classList.toggle(className),

  // Local storage helpers
  storage: {
    get: (key, defaultValue = null) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch {
        return defaultValue;
      }
    },
    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },
    remove: (key) => localStorage.removeItem(key)
  },

  // Input validation
  validateEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  validatePassword: (password) => password.length >= 6,

  // Debounce function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Show notification
  showNotification: (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      borderRadius: '6px',
      zIndex: '9999',
      color: 'white',
      fontWeight: '500',
      backgroundColor: type === 'error' ? '#ff0033' : type === 'success' ? '#00ff88' : '#00c6ff'
    });

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }
};

// ===== SEARCH FUNCTIONALITY =====
const SearchModule = {
  init() {
    const searchInput = Utils.getElement('#searchInput');
    if (!searchInput) return;

    // Debounced search for performance
    const debouncedSearch = Utils.debounce(this.performSearch.bind(this), 300);
    searchInput.addEventListener('input', debouncedSearch);
    
    // Clear search on Escape key
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.clearSearch();
      }
    });
  },

  performSearch(event) {
    const searchTerm = event.target.value.trim().toLowerCase();
    const allCards = Utils.getElements('.category-card');
    const allSections = Utils.getElements('section');

    if (!searchTerm) {
      this.showAllItems(allCards, allSections);
      return;
    }

    this.filterItems(searchTerm, allCards, allSections);
  },

  filterItems(searchTerm, cards, sections) {
    // Filter cards
    cards.forEach(card => {
      const cardText = card.textContent.toLowerCase();
      const isVisible = cardText.includes(searchTerm);
      card.style.display = isVisible ? '' : 'none';
      
      // Add highlight effect for visible cards
      if (isVisible) {
        Utils.addClass(card, 'search-highlight');
        setTimeout(() => Utils.removeClass(card, 'search-highlight'), 500);
      }
    });

    // Hide empty sections
    sections.forEach(section => {
      const sectionCards = section.querySelectorAll('.category-card');
      const visibleCards = Array.from(sectionCards).filter(card => 
        card.style.display !== 'none'
      );
      
      section.style.display = sectionCards.length > 0 && visibleCards.length === 0 ? 'none' : '';
    });
  },

  showAllItems(cards, sections) {
    cards.forEach(card => {
      card.style.display = '';
      Utils.removeClass(card, 'search-highlight');
    });
    sections.forEach(section => section.style.display = '');
  },

  clearSearch() {
    const searchInput = Utils.getElement('#searchInput');
    if (searchInput) {
      searchInput.value = '';
      this.showAllItems(
        Utils.getElements('.category-card'),
        Utils.getElements('section')
      );
    }
  }
};

// ===== AUTHENTICATION MODULE =====
const AuthModule = {
  currentUser: null,
  loginAttempts: 0,

  init() {
    this.bindEvents();
    this.checkAuthStatus();
  },

  bindEvents() {
    const authButton = Utils.getElement('#authButton');
    const closeModalBtn = Utils.getElement('#closeModalBtn');
    const authToggle = Utils.getElement('#authToggle');
    const loginBtn = Utils.getElement('#loginBtn');
    const registerSubmitBtn = Utils.getElement('#registerSubmitBtn');

    authButton?.addEventListener('click', () => this.showModal());
    closeModalBtn?.addEventListener('click', () => this.hideModal());
    authToggle?.addEventListener('click', () => this.toggleMode());
    loginBtn?.addEventListener('click', () => this.handleLogin());
    registerSubmitBtn?.addEventListener('click', () => this.handleRegister());

    // Close modal on outside click
    Utils.getElement('#authModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'authModal') this.hideModal();
    });

    // Logout functionality
    Utils.getElement('#logoutBtn')?.addEventListener('click', () => this.logout());
  },

  showModal() {
    const modal = Utils.getElement('#authModal');
    if (modal) {
      modal.style.display = 'flex';
      Utils.getElement('#authEmail')?.focus();
    }
  },

  hideModal() {
    const modal = Utils.getElement('#authModal');
    if (modal) {
      modal.style.display = 'none';
      this.clearForm();
      this.clearErrors();
    }
  },

  toggleMode() {
    const isLoginMode = Utils.getElement('#loginBtn').style.display !== 'none';
    const title = Utils.getElement('#authTitle');
    const toggle = Utils.getElement('#authToggle');
    const passwordConfirm = Utils.getElement('#passwordConfirmGroup');
    const nameGroup = Utils.getElement('#nameGroup');
    const loginBtn = Utils.getElement('#loginBtn');
    const registerBtn = Utils.getElement('#registerSubmitBtn');

    if (isLoginMode) {
      // Switch to register mode
      title.textContent = 'Create Account';
      toggle.textContent = 'Already have an account? Login';
      Utils.show(passwordConfirm);
      Utils.show(nameGroup);
      Utils.hide(loginBtn);
      Utils.show(registerBtn);
    } else {
      // Switch to login mode
      title.textContent = 'Login to Your Account';
      toggle.textContent = 'Need an account? Register';
      Utils.hide(passwordConfirm);
      Utils.hide(nameGroup);
      Utils.show(loginBtn);
      Utils.hide(registerBtn);
    }
    
    this.clearErrors();
  },

  handleLogin() {
    const email = Utils.getElement('#authEmail').value.trim();
    const password = Utils.getElement('#authPassword').value;

    if (!this.validateInput(email, password)) return;

    // Rate limiting
    if (this.loginAttempts >= CONFIG.security.maxLoginAttempts) {
      this.showError('Too many login attempts. Please try again later.');
      return;
    }

    const users = Utils.storage.get(CONFIG.storage.keys.users, {});
    
    if (users[email] && users[email].password === password) {
      this.loginSuccess(users[email]);
    } else {
      this.loginAttempts++;
      this.showError('Invalid email or password');
      
      if (this.loginAttempts >= CONFIG.security.maxLoginAttempts) {
        setTimeout(() => { this.loginAttempts = 0; }, CONFIG.security.rateLimitDelay);
      }
    }
  },

  handleRegister() {
    const email = Utils.getElement('#authEmail').value.trim();
    const password = Utils.getElement('#authPassword').value;
    const passwordConfirm = Utils.getElement('#authPasswordConfirm').value;
    const name = Utils.getElement('#authName').value.trim() || 'User';

    if (!this.validateInput(email, password)) return;

    if (password !== passwordConfirm) {
      this.showError('Passwords do not match');
      return;
    }

    const users = Utils.storage.get(CONFIG.storage.keys.users, {});
    
    if (users[email]) {
      this.showError('Email already registered');
      return;
    }

    const newUser = {
      email,
      password,
      name,
      registeredAt: new Date().toISOString()
    };

    users[email] = newUser;
    Utils.storage.set(CONFIG.storage.keys.users, users);
    
    this.loginSuccess(newUser);
    Utils.showNotification('Account created successfully!', 'success');
  },

  validateInput(email, password) {
    this.clearErrors();

    if (!email || !password) {
      this.showError('Please fill in all fields');
      return false;
    }

    if (!Utils.validateEmail(email)) {
      this.showError('Please enter a valid email address');
      return false;
    }

    if (!Utils.validatePassword(password)) {
      this.showError('Password must be at least 6 characters');
      return false;
    }

    return true;
  },

  loginSuccess(user) {
    this.currentUser = user;
    Utils.storage.set(CONFIG.storage.keys.currentUser, user);
    this.updateUI();
    this.hideModal();
    this.loginAttempts = 0;
    Utils.showNotification(`Welcome back, ${user.name}!`, 'success');
  },

  logout() {
    this.currentUser = null;
    Utils.storage.remove(CONFIG.storage.keys.currentUser);
    this.updateUI();
    Utils.showNotification('Logged out successfully', 'info');
  },

  checkAuthStatus() {
    const savedUser = Utils.storage.get(CONFIG.storage.keys.currentUser);
    if (savedUser) {
      this.currentUser = savedUser;
      this.updateUI();
    }
  },

  updateUI() {
    const authButton = Utils.getElement('#authButton');
    const logoutBtn = Utils.getElement('#logoutBtn');
    const userGreeting = Utils.getElement('#userGreeting');

    if (this.currentUser) {
      Utils.hide(authButton);
      Utils.show(logoutBtn);
      Utils.show(userGreeting);
      userGreeting.textContent = `Hello, ${this.currentUser.name}`;
    } else {
      Utils.show(authButton);
      Utils.hide(logoutBtn);
      Utils.hide(userGreeting);
    }
  },

  showError(message) {
    const errorElement = Utils.getElement('#authError');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  },

  clearErrors() {
    const errorElement = Utils.getElement('#authError');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  },

  clearForm() {
    ['#authEmail', '#authPassword', '#authPasswordConfirm', '#authName'].forEach(selector => {
      const element = Utils.getElement(selector);
      if (element) element.value = '';
    });
  }
};

// ===== CONTACT FORM MODULE =====
const ContactModule = {
  init() {
    const contactForm = Utils.getElement('#contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', this.handleSubmit.bind(this));
    }
  },

  async handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    if (!this.validateForm(data)) return;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    try {
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      // Simulate form submission (replace with actual EmailJS or API call)
      await this.sendEmail(data);
      
      this.showSuccess('Thank you for your message! We will get back to you soon.');
      e.target.reset();
      
    } catch (error) {
      this.showError('Failed to send message. Please try again.');
      console.error('Contact form error:', error);
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  },

  validateForm(data) {
    if (!data.name?.trim() || !data.reply_to?.trim() || !data.subject?.trim() || !data.message?.trim()) {
      this.showError('Please fill in all required fields');
      return false;
    }

    if (!Utils.validateEmail(data.reply_to)) {
      this.showError('Please enter a valid email address');
      return false;
    }

    return true;
  },

  async sendEmail(data) {
    // Simulate API delay
    return new Promise(resolve => setTimeout(resolve, 1000));
    
    // Uncomment to use EmailJS:
    // return emailjs.send(
    //   CONFIG.emailjs.serviceId,
    //   CONFIG.emailjs.templateId,
    //   data,
    //   CONFIG.emailjs.publicKey
    // );
  },

  showSuccess(message) {
    const statusElement = Utils.getElement('#statusMessage');
    if (statusElement) {
      statusElement.innerHTML = `<p style="color: var(--success); font-weight: 500;">${message}</p>`;
    }
    Utils.showNotification(message, 'success');
  },

  showError(message) {
    const statusElement = Utils.getElement('#statusMessage');
    if (statusElement) {
      statusElement.innerHTML = `<p style="color: var(--error); font-weight: 500;">${message}</p>`;
    }
    Utils.showNotification(message, 'error');
  }
};

// ===== CART MODULE (for shop page) =====
const CartModule = {
  init() {
    this.updateCartDisplay();
    this.bindEvents();
  },

  bindEvents() {
    // Add to cart buttons (if they exist)
    Utils.getElements('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', this.addToCart.bind(this));
    });
  },

  addToCart(e) {
    e.preventDefault();
    const currentCount = Utils.storage.get(CONFIG.storage.keys.cartCount, 0);
    const newCount = currentCount + 1;
    
    Utils.storage.set(CONFIG.storage.keys.cartCount, newCount);
    this.updateCartDisplay();
    
    Utils.showNotification('Item added to cart!', 'success');
  },

  updateCartDisplay() {
    const cartCounter = Utils.getElement('.cart-counter');
    if (cartCounter) {
      const count = Utils.storage.get(CONFIG.storage.keys.cartCount, 0);
      cartCounter.textContent = count;
      
      // Add animation
      Utils.addClass(cartCounter, 'cart-update');
      setTimeout(() => Utils.removeClass(cartCounter, 'cart-update'), 500);
    }
  }
};

// ===== ANIMATION MODULE =====
const AnimationModule = {
  init() {
    this.observeElements();
    this.addHoverEffects();
  },

  observeElements() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          Utils.addClass(entry.target, 'animate-in');
        }
      });
    }, { threshold: 0.1 });

    Utils.getElements('.category-card').forEach(card => {
      observer.observe(card);
    });
  },

  addHoverEffects() {
    Utils.getElements('.category-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        Utils.addClass(card, 'hover-effect');
      });
      
      card.addEventListener('mouseleave', () => {
        Utils.removeClass(card, 'hover-effect');
      });
    });
  }
};

// ===== MAIN APPLICATION =====
class FreeFinder {
  constructor() {
    this.modules = [
      SearchModule,
      AuthModule,
      ContactModule,
      CartModule,
      AnimationModule
    ];
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  }

  start() {
    console.log('🚀 Free Finder initialized');
    
    // Initialize all modules
    this.modules.forEach(module => {
      try {
        module.init();
      } catch (error) {
        console.error(`Failed to initialize module:`, error);
      }
    });

    // Initialize EmailJS if available
    if (typeof emailjs !== 'undefined') {
      emailjs.init({
        publicKey: CONFIG.emailjs.publicKey,
        blockHeadless: true,
        limitRate: {
          id: 'app',
          throttle: 10000
        }
      });
    }
  }
}

// ===== INITIALIZE APPLICATION =====
const app = new FreeFinder();
app.init();

// ===== GLOBAL UTILITIES =====
window.FreeFinder = {
  search: SearchModule,
  auth: AuthModule,
  contact: ContactModule,
  cart: CartModule,
  utils: Utils
};


document.querySelector('.menu-toggle').addEventListener('click', function() {
  document.querySelector('.header-right nav ul').classList.toggle('active');
  this.classList.toggle('active');
});
