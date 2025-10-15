document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("header")
  const profileIcon = document.getElementById("profileIcon")
  const profileDropdown = document.getElementById("profileDropdown")
  const loginBtn = document.getElementById("loginBtn")
  const logoutBtn = document.getElementById("logoutBtn")

  // Header scroll effect
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled")
    } else {
      header.classList.remove("scrolled")
    }
  })

  // Check if user is logged in
  function checkLoginStatus() {
    const currentUser = localStorage.getItem("currentUser")

    if (currentUser) {
      // User is logged in
      if (loginBtn) loginBtn.style.display = "none"
      if (profileIcon) profileIcon.style.display = "block"

      // Update UI elements that depend on login status
      const runwayLoginPrompt = document.getElementById("runwayLoginPrompt")
      if (runwayLoginPrompt) runwayLoginPrompt.style.display = "none"

      // Load user-specific content
      function loadUserWardrobe() {
        // Implementation for loading user wardrobe
        console.log("Loading user wardrobe...")
      }

      function loadUserRecommendations() {
        // Implementation for loading user recommendations
        console.log("Loading user recommendations...")
      }

      loadUserWardrobe()
      loadUserRecommendations()
    } else {
      // User is not logged in
      if (loginBtn) loginBtn.style.display = "block"
      if (profileIcon) profileIcon.style.display = "none"
    }
  }

  // Toggle profile dropdown
  if (profileIcon) {
    profileIcon.addEventListener("click", (e) => {
      e.stopPropagation()
      profileDropdown.style.display = profileDropdown.style.display === "block" ? "none" : "block"
    })
  }

  // Close dropdown when clicking elsewhere
  document.addEventListener("click", () => {
    if (profileDropdown) profileDropdown.style.display = "none"
  })

  // Logout functionality
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault()
      localStorage.removeItem("currentUser")
      alert("You have been logged out.")
      window.location.href = "index.html"
    })
  }

  // Initialize
  checkLoginStatus()
})

