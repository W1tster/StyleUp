document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm")
  const registerForm = document.getElementById("registerForm")
  const showRegister = document.getElementById("showRegister")
  const showLogin = document.getElementById("showLogin")
  const loginFormElement = document.getElementById("loginFormElement")
  const registerFormElement = document.getElementById("registerFormElement")

  // Toggle between login and register forms
  if (showRegister) {
    showRegister.addEventListener("click", (e) => {
      e.preventDefault()
      loginForm.classList.add("hidden")
      registerForm.classList.remove("hidden")
    })
  }

  if (showLogin) {
    showLogin.addEventListener("click", (e) => {
      e.preventDefault()
      registerForm.classList.add("hidden")
      loginForm.classList.remove("hidden")
    })
  }

  // Handle login form submission
  if (loginFormElement) {
    loginFormElement.addEventListener("submit", (e) => {
      e.preventDefault()

      const email = document.getElementById("loginEmail").value
      const password = document.getElementById("loginPassword").value

      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem("users")) || []

      // Find user with matching email and password
      const user = users.find((u) => u.email === email && u.password === password)

      if (user) {
        // Store current user in localStorage (without password)
        const currentUser = {
          name: user.name,
          email: user.email,
          id: user.id,
        }

        localStorage.setItem("currentUser", JSON.stringify(currentUser))

        alert("Login successful!")
        window.location.href = "index.html"
      } else {
        alert("Invalid email or password. Please try again.")
      }
    })
  }

  // Handle register form submission
  if (registerFormElement) {
    registerFormElement.addEventListener("submit", (e) => {
      e.preventDefault()

      const name = document.getElementById("registerName").value
      const email = document.getElementById("registerEmail").value
      const password = document.getElementById("registerPassword").value
      const confirmPassword = document.getElementById("confirmPassword").value

      // Validate passwords match
      if (password !== confirmPassword) {
        alert("Passwords do not match. Please try again.")
        return
      }

      // Get existing users from localStorage
      const users = JSON.parse(localStorage.getItem("users")) || []

      // Check if email already exists
      if (users.some((user) => user.email === email)) {
        alert("Email already in use. Please use a different email or login.")
        return
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name: name,
        email: email,
        password: password,
        wardrobe: [],
      }

      // Add user to users array
      users.push(newUser)

      // Save updated users array to localStorage
      localStorage.setItem("users", JSON.stringify(users))

      // Store current user in localStorage (without password)
      const currentUser = {
        name: newUser.name,
        email: newUser.email,
        id: newUser.id,
      }

      localStorage.setItem("currentUser", JSON.stringify(currentUser))

      alert("Registration successful! You are now logged in.")
      window.location.href = "index.html"
    })
  }
})

