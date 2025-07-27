// Shop Navigation Functionality
document.addEventListener('DOMContentLoaded', function() {
  const shopLink = document.querySelector('.shop-link');
  const cartCounter = document.querySelector('.cart-counter');
  
  if (!shopLink || !cartCounter) return;

  // Cart count simulation (replace with your actual cart logic)
  let cartCount = localStorage.getItem('cartCount') || 0;
  updateCartCounter(cartCount);

  // Highlight current page
  if (window.location.pathname.includes('shop.html')) {
    shopLink.classList.add('active');
  }

  // Add click effect
  shopLink.addEventListener('click', function(e) {
    if (!e.target.closest('.cart-counter')) {
      // Add ripple effect
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      this.appendChild(ripple);
      
      // Remove ripple after animation
      setTimeout(() => ripple.remove(), 600);
    }
  });

  // Cart counter updates (example)
  function updateCartCounter(count) {
    cartCount = count;
    localStorage.setItem('cartCount', count);
    cartCounter.textContent = count;
    cartCounter.classList.add('cart-update');
    setTimeout(() => cartCounter.classList.remove('cart-update'), 500);
  }

  // Example: Add to cart functionality
  window.addToCart = function() {
    updateCartCounter(++cartCount);
  };
});
document.querySelector('.menu-toggle').addEventListener('click', function() {
  document.querySelector('.header-right nav ul').classList.toggle('active');
  this.classList.toggle('active');
});
// Enhanced Navigation Functionality
document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const shopLink = document.querySelector('.shop-link');
  const cartCounter = document.querySelector('.cart-counter');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelectorAll('.header-right nav a');
  const navList = document.querySelector('.header-right nav ul');
  const header = document.querySelector('header');
  
  // Initialize cart count
  let cartCount = parseInt(localStorage.getItem('cartCount')) || 0;
  
  // Initialize navigation
  initNavigation();
  
  function initNavigation() {
    // Set up cart counter if elements exist
    if (shopLink && cartCounter) {
      updateCartCounter(cartCount);
      
      // Highlight current page
      if (window.location.pathname.includes('shop')) {
        shopLink.classList.add('active');
      }
      
      // Add click effect to shop link
      shopLink.addEventListener('click', function(e) {
        if (!e.target.closest('.cart-counter')) {
          createRippleEffect(this, e);
        }
      });
    }
    
    // Mobile menu toggle
    if (menuToggle) {
      menuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Smooth scrolling for anchor links
    navLinks.forEach(link => {
      if (link.hash) {
        link.addEventListener('click', smoothScroll);
      }
      
      // Set active state based on current page
      if (link.href === window.location.href) {
        link.classList.add('active');
      }
    });
    
    // Close mobile menu when clicking a link
    navList.addEventListener('click', function(e) {
      if (e.target.tagName === 'A' && window.innerWidth <= 992) {
        toggleMobileMenu();
      }
    });
    
    // Sticky header effect
    window.addEventListener('scroll', function() {
      if (window.scrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }
  
  // Cart functionality
  function updateCartCounter(count) {
    cartCount = count;
    localStorage.setItem('cartCount', count);
    
    if (cartCounter) {
      cartCounter.textContent = count;
      cartCounter.classList.toggle('empty', count === 0);
      
      // Animation
      cartCounter.classList.add('cart-update');
      setTimeout(() => {
        cartCounter.classList.remove('cart-update');
      }, 500);
      
      // Bounce animation if adding items
      if (count > parseInt(localStorage.getItem('cartCount')) || 0) {
        cartCounter.classList.add('bounce');
        setTimeout(() => {
          cartCounter.classList.remove('bounce');
        }, 1000);
      }
    }
  }
  
  // Mobile menu toggle
  function toggleMobileMenu() {
    menuToggle.classList.toggle('active');
    navList.classList.toggle('active');
    document.body.classList.toggle('menu-open');
    
    // Animate menu items
    if (navList.classList.contains('active')) {
      animateMenuItems();
    }
  }
  
  // Animate mobile menu items
  function animateMenuItems() {
    const links = navList.querySelectorAll('li');
    links.forEach((link, index) => {
      link.style.animation = `navLinkFade 0.5s ease forwards ${index * 0.1}s`;
    });
  }
  
  // Ripple effect for buttons
  function createRippleEffect(element, event) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }
  
  // Smooth scrolling for anchor links
  function smoothScroll(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - header.offsetHeight,
        behavior: 'smooth'
      });
      
      // Update URL without page reload
      if (history.pushState) {
        history.pushState(null, null, targetId);
      } else {
        window.location.hash = targetId;
      }
    }
  }
  
  // Example add to cart function (can be called from product pages)
  window.addToCart = function(quantity = 1) {
    updateCartCounter(cartCount + quantity);
    
    // Show notification
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>Item added to cart!</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }, 2000);
    }, 10);
  };
  
  // Initialize header state
  header.classList.toggle('scrolled', window.scrollY > 100);
});