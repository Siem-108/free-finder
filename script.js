// Initialize EmailJS with enhanced security
(function() {
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
const adminDashboard = document.getElementById('adminDashboard'); // New element for admin interface

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

// Enhanced Contact Form Function
function sendMail(event) {
  event.preventDefault();

  const serviceID = 'service_t5qcgjv';
  const adminTemplateID = 'template_f1tvom3'; // Only sending to admin now

  // Get and validate form values
  const formData = {
    userName: document.getElementById('name').value.trim(),
    userEmail: document.getElementById('email').value.trim(),
    userSubject: document.getElementById('subject').value.trim(),
    userMessage: document.getElementById('message').value.trim()
  };

  // Enhanced validation
  if (!Object.values(formData).every(Boolean)) {
    showStatusMessage('Please fill in all required fields', 'error');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)) {
    showStatusMessage('Please enter a valid email address', 'error');
    return;
  }

  // Prepare admin email parameters
  const adminParams = {
    from_name: formData.userName,
    reply_to: formData.userEmail,
    to_email: "yourbusiness@email.com",
    subject: `New Contact: ${formData.userSubject}`,
    message: formData.userMessage,
    logo_url: "https://i.imgur.com/31ZeO6z.jpeg",
    received_at: new Date().toLocaleString(),
    user_ip: "80.233.40.87"
  };

  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;

  // Send only the admin email
  emailjs.send(serviceID, adminTemplateID, adminParams)
    .then(() => {
      showStatusMessage('✅ Message sent! We\'ll reply soon.', 'success');
      contactForm.reset();
      
      // Store message in localStorage for admin dashboard
      if (adminDashboard) {
        storeMessageForAdmin(formData);
      }
    })
    .catch((error) => {
      console.error('EmailJS Error:', error);
      showStatusMessage('❌ Failed to send message. Please try again.', 'error');
    })
    .finally(() => {
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    });
}

// Enhanced Manual Reply Function
async function sendManualReply(userEmail, userName, replyMessage) {
  const serviceID = 'service_t5qcgjv';
  const userReplyTemplateID = 'template_qawufof';

  try {
    const replyParams = {
      name: userName,
      email: userEmail,
      subject: "Re: Your Inquiry",
      message: replyMessage,
      logo_url: "https://i.imgur.com/31ZeO6z.jpeg",
      reply_date: new Date().toLocaleDateString(),
      reply_time: new Date().toLocaleTimeString()
    };

    await emailjs.send(serviceID, userReplyTemplateID, replyParams);
    return { success: true, message: 'Reply sent successfully!' };
  } catch (error) {
    console.error('Reply failed:', error);
    return { success: false, message: 'Failed to send reply. Please try again.' };
  }
}

// New: Store messages for admin dashboard
function storeMessageForAdmin(messageData) {
  const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
  messages.push({
    ...messageData,
    received_at: new Date().toISOString(),
    replied: false
  });
  localStorage.setItem('contactMessages', JSON.stringify(messages));
}

// New: Load messages for admin dashboard
function loadAdminMessages() {
  if (!adminDashboard) return;
  
  const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
  adminDashboard.innerHTML = messages.map((msg, index) => `
    <div class="message-card ${msg.replied ? 'replied' : ''}">
      <h3>From: ${msg.userName} (${msg.userEmail})</h3>
      <p><strong>Subject:</strong> ${msg.userSubject}</p>
      <p>${msg.userMessage}</p>
      <small>Received: ${new Date(msg.received_at).toLocaleString()}</small>
      ${!msg.replied ? `
        <textarea id="reply-${index}" placeholder="Type your reply..."></textarea>
        <button onclick="adminSendReply(${index}, '${msg.userEmail}', '${msg.userName}')">Send Reply</button>
      ` : '<span class="replied-badge">Replied</span>'}
    </div>
  `).join('');
}

// New: Admin reply function
async function adminSendReply(index, userEmail, userName) {
  const replyText = document.getElementById(`reply-${index}`).value.trim();
  if (!replyText) {
    alert('Please enter a reply message');
    return;
  }

  const result = await sendManualReply(userEmail, userName, replyText);
  if (result.success) {
    // Update message status
    const messages = JSON.parse(localStorage.getItem('contactMessages'));
    messages[index].replied = true;
    localStorage.setItem('contactMessages', JSON.stringify(messages));
    loadAdminMessages();
  }
  alert(result.message);
}

// Enhanced Auth Functions
function openAuthModal() {
  authModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
  authModal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

function loginUser() {
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  const stored = JSON.parse(localStorage.getItem('users') || '{}');

  if (stored[email] && stored[email] === password) {
    localStorage.setItem('loggedInUser', email);
    alert('✅ Login successful!');
    closeAuthModal();
    if (adminDashboard) loadAdminMessages();
  } else {
    alert('❌ Invalid email or password.');
  }
}

function registerUser() {
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;

  if (!email || !password) {
    alert('❗ Please fill in both fields.');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert('❗ Please enter a valid email address.');
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

// Enhanced Search Functionality
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
        <div class="search-result">
          <a href="${card.href}" target="_blank">${card.querySelector('p').textContent}</a>
          <p class="description">${card.dataset.description || ''}</p>
        </div>
      `;
    }
  });

  if (!found) {
    resultsContainer.innerHTML = '<p style="text-align:center;color:#aaa;">No results found.</p>';
  }
}

// On page load
document.addEventListener('DOMContentLoaded', function() {
  const user = localStorage.getItem('loggedInUser');
  if (!user && window.location.pathname.includes('contact.html')) {
    openAuthModal();
  }

  // Enhanced external link confirmation
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', function(e) {
      e.preventDefault();
      if (confirm(`🔔 You are leaving Free Finder to visit: ${this.href}\n\nContinue?`)) {
        window.open(this.href, '_blank');
      }
    });
  });

  // Load admin messages if on dashboard
  if (adminDashboard && user) {
    loadAdminMessages();
  }
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
  if (event.target === authModal) {
    closeAuthModal();
  }
});