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