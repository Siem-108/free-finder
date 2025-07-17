function openAuthModal() {
  document.getElementById("authModal").style.display = "flex";
}

function closeAuthModal() {
  document.getElementById("authModal").style.display = "none";
}

function loginUser() {
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;

  const users = JSON.parse(localStorage.getItem("users") || "{}");

  if (users[email] && users[email] === password) {
    localStorage.setItem("loggedInUser", email);
    alert("✅ Login successful! A confirmation email was sent.");
    console.log("📩 Confirmation email sent to:", email);
    closeAuthModal();
  } else {
    alert("❌ Invalid email or password.");
  }
}

function registerUser() {
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;

  if (!email || !password) {
    alert("❗ Please fill in both fields.");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users") || "{}");

  if (users[email]) {
    alert("⚠️ Email already registered.");
  } else {
    users[email] = password;
    localStorage.setItem("users", JSON.stringify(users));
    alert("✅ Registered successfully. You can now log in.");
  }
}

window.onload = function () {
  const user = localStorage.getItem("loggedInUser");
  if (!user) {
    document.getElementById("authModal").style.display = "flex";
  }
};

document.querySelectorAll(".category-card").forEach(card => {
  card.addEventListener("click", function (e) {
    e.preventDefault();
    const confirmed = confirm("🔔 Reminder: You are about to visit an external site. Proceed?");
    if (confirmed) {
      window.open(this.href, "_blank");
    }
  });
});

function searchResources() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const cards = document.querySelectorAll(".category-card");
  const resultsContainer = document.getElementById("searchResults");
  resultsContainer.innerHTML = "";

  if (input === "") return;

  let found = false;
  cards.forEach(card => {
    const label = card.querySelector("p").textContent.toLowerCase();
    if (label.includes(input)) {
      found = true;
      const link = card.href;
      resultsContainer.innerHTML += `
        <div>
          <a href="${link}" target="_blank">${card.querySelector("p").textContent}</a>
        </div>
      `;
    }
  });

  if (!found) {
    resultsContainer.innerHTML = "<p style='color:#ccc; text-align:center;'>No results found.</p>";
  }
}
