// Initialize EmailJS
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

// Event Listeners
if (contactForm) {
  contactForm.addEventListener('submit', sendMail);
}

if (authButton) {
  authButton.addEventListener('click', openAuthModal);
}

if (loginBtn) {
  loginBtn.addEventListener('click', loginUser);
}

if (registerBtn) {
  registerBtn.addEventListener('click', registerUser);
}

if (closeModalBtn) {
  closeModalBtn.addEventListener('click', closeAuthModal);
}

if (searchInput) {
  searchInput.addEventListener('keyup', searchResources);
}

// Contact Form Function
function sendMail(event) {
  event.preventDefault();

  const serviceID = 'service_t5qcgjv';
  const adminTemplateID = 'template_f1tvom3';         // Message to YOU
  const userReplyTemplateID = 'template_qawufof'; // Reply to USER
  

  const params = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    subject: document.getElementById('subject').value.trim(),
    message: document.getElementById('message').value.trim(),
    logo_url: "https://i.imgur.com/31ZeO6z.jpeg"
  };

  // Validate inputs
  if (!params.name || !params.email || !params.subject || !params.message) {
    showStatusMessage('Please fill in all required fields', 'error');
    return;
  }

  // Email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(params.email)) {
    showStatusMessage('Please enter a valid email address', 'error');
    return;
  }

  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;

  // Step 1: Send to YOU
  emailjs.send(serviceID, adminTemplateID, params)
    .then(() => {
      // Step 2: Send confirmation to USER
      return emailjs.send(serviceID, userReplyTemplateID, params);
    })
    .then(() => {
      showStatusMessage('✅ Message sent! You’ll get a confirmation email shortly.', 'success');
      contactForm.reset();
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    })
    .catch((error) => {
      console.error('EmailJS Error:', error);
      showStatusMessage('❌ Failed to send message. Please try again later.', 'error');
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    });
}

// Show status message
function showStatusMessage(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = type;
  statusMessage.classList.add('show');
  setTimeout(() => {
    statusMessage.classList.remove('show');
  }, 5000);
}

// Auth Functions
function openAuthModal() {
  authModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
  authModal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

function loginUser() {
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  const stored = JSON.parse(localStorage.getItem('users') || '{}');

  if (stored[email] && stored[email] === password) {
    localStorage.setItem('loggedInUser', email);
    alert('✅ Login successful!');
    closeAuthModal();
  } else {
    alert('❌ Invalid email or password.');
  }
}

function registerUser() {
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;

  if (!email || !password) {
    alert('❗ Please fill in both fields.');
    return;
  }

  let users = JSON.parse(localStorage.getItem('users') || '{}');
  if (users[email]) {
    alert('⚠️ Email already registered.');
  } else {
    users[email] = password;
    localStorage.setItem('users', JSON.stringify(users));
    alert('✅ Registered successfully. You can now log in.');
  }
}

// Search Functionality
function searchResources() {
  const input = searchInput.value.toLowerCase();
  const cards = document.querySelectorAll('.category-card');
  const resultsContainer = document.getElementById('searchResults');
  resultsContainer.innerHTML = '';

  if (!input) return;

  let found = false;

  cards.forEach(card => {
    const label = card.querySelector('p').textContent.toLowerCase();
    if (label.includes(input)) {
      found = true;
      resultsContainer.innerHTML += `
        <div>
          <a href="${card.href}" target="_blank">${card.querySelector('p').textContent}</a>
        </div>
      `;
    }
  });

  if (!found) {
    resultsContainer.innerHTML = '<p style="text-align:center;color:#aaa;">No results found.</p>';
  }
}

// On page load
document.addEventListener('DOMContentLoaded', function () {
  const user = localStorage.getItem('loggedInUser');
  if (!user && window.location.pathname.includes('contact.html')) {
    openAuthModal();
  }

  // External link confirm
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', function (e) {
      e.preventDefault();
      if (confirm('🔔 You are leaving Free Finder. Continue to external site?')) {
        window.open(this.href, '_blank');
      }
    });
  });
});

// Close modal when clicking outside
window.addEventListener('click', function (event) {
  if (event.target === authModal) {
    closeAuthModal();
  }
});
