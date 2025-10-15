document.addEventListener("DOMContentLoaded", () => {
  const wardrobeItems = document.getElementById("wardrobeItems")
  const emptyWardrobe = document.getElementById("emptyWardrobe")
  const filterButtons = document.querySelectorAll(".filter-button")
  const createOutfitBtn = document.getElementById("createOutfitBtn")
  const wardrobeTabs = document.querySelectorAll(".wardrobe-tab")
  const combosContainer = document.getElementById("combosContainer")
  const itemsContainer = document.getElementById("itemsContainer")

  // Check if user is logged in
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (!currentUser) {
    // Redirect to login page if not logged in
    alert("Please login to view your wardrobe.")
    window.location.href = "login.html"
    return
  }

  // Tab functionality
  if (wardrobeTabs) {
    wardrobeTabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        // Remove active class from all tabs
        wardrobeTabs.forEach((t) => t.classList.remove("active"))

        // Add active class to clicked tab
        this.classList.add("active")

        // Show/hide appropriate containers
        if (this.dataset.tab === "items") {
          itemsContainer.style.display = "block"
          combosContainer.style.display = "none"
          loadWardrobe()
        } else {
          itemsContainer.style.display = "none"
          combosContainer.style.display = "block"
          loadCombos()
        }
      })
    })
  }

  // Load user's wardrobe
  function loadWardrobe(category = "all") {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || []

    // Find current user in users array
    const userIndex = users.findIndex((u) => u.id === currentUser.id)

    if (userIndex === -1) {
      alert("User not found. Please login again.")
      return
    }

    // Get user's wardrobe
    const wardrobe = users[userIndex].wardrobe || []

    // Clear previous items
    wardrobeItems.innerHTML = ""

    // Filter items by category if needed
    const filteredItems = category === "all" ? wardrobe : wardrobe.filter((item) => item.category === category)

    // Show empty wardrobe message if no items
    if (filteredItems.length === 0) {
      emptyWardrobe.style.display = "block"
      return
    }

    // Hide empty wardrobe message
    emptyWardrobe.style.display = "none"

    // Display each item
    filteredItems.forEach((item) => {
      const itemElement = document.createElement("div")
      itemElement.className = "wardrobe-item"
      itemElement.dataset.id = item.id

      itemElement.innerHTML = `
        <div class="wardrobe-item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="wardrobe-item-info">
          <h3>${item.name}</h3>
          <p>${capitalizeFirstLetter(item.category)}</p>
        </div>
        <div class="wardrobe-item-actions">
          <button class="remove-item-btn" data-id="${item.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `

      wardrobeItems.appendChild(itemElement)
    })

    // Add event listeners to remove buttons
    const removeButtons = document.querySelectorAll(".remove-item-btn")
    removeButtons.forEach((button) => {
      button.addEventListener("click", function (e) {
        e.stopPropagation()
        const itemId = this.dataset.id
        removeFromWardrobe(itemId)
      })
    })
  }

  // Function to remove item from wardrobe
  function removeFromWardrobe(itemId) {
    if (confirm("Are you sure you want to remove this item from your wardrobe?")) {
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem("users")) || []
      const currentUser = JSON.parse(localStorage.getItem("currentUser"))
      const userIndex = users.findIndex((u) => u.id === currentUser.id)

      if (userIndex === -1) {
        alert("User not found. Please login again.")
        return
      }

      // Filter out the item to remove
      users[userIndex].wardrobe = (users[userIndex].wardrobe || []).filter((item) => item.id !== itemId)

      // Save updated users array to localStorage
      localStorage.setItem("users", JSON.stringify(users))

      // Reload wardrobe
      const activeFilter = document.querySelector(".filter-button.active")
      const category = activeFilter ? activeFilter.dataset.category : "all"
      loadWardrobe(category)
    }
  }

  // Load user's outfit combinations
  function loadCombos() {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || []

    // Find current user in users array
    const userIndex = users.findIndex((u) => u.id === currentUser.id)

    if (userIndex === -1) {
      alert("User not found. Please login again.")
      return
    }

    // Get user's outfits
    const outfits = users[userIndex].outfits || []

    // Clear previous items
    const combosItems = document.getElementById("combosItems")
    combosItems.innerHTML = ""

    // Show empty message if no outfits
    const emptyCombos = document.getElementById("emptyCombos")
    if (outfits.length === 0) {
      emptyCombos.style.display = "block"
      return
    }

    // Hide empty message
    emptyCombos.style.display = "none"

    // Display each outfit
    outfits.forEach((outfit) => {
      const outfitElement = document.createElement("div")
      outfitElement.className = "combo-item"
      outfitElement.dataset.id = outfit.id

      // Create items grid
      let itemsHTML = ""
      if (outfit.items && outfit.items.length > 0) {
        outfit.items.forEach((item) => {
          itemsHTML += `
            <div class="outfit-item">
              <img src="${item.image}" alt="${item.name}">
              <p>${item.name}</p>
            </div>
          `
        })
      } else {
        itemsHTML = `<p class="no-items">No specific items matched</p>`
      }

      outfitElement.innerHTML = `
        <div class="combo-header">
          <h3>${outfit.name || "Outfit"}</h3>
          <button class="delete-combo" data-id="${outfit.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <p class="combo-description">${outfit.description || "Custom outfit"}</p>
        <div class="outfit-items">
          ${itemsHTML}
        </div>
      `

      combosItems.appendChild(outfitElement)
    })

    // Add event listeners to delete buttons
    const deleteButtons = document.querySelectorAll(".delete-combo")
    deleteButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const outfitId = this.dataset.id
        deleteOutfit(outfitId)
      })
    })
  }

  // Delete an outfit
  function deleteOutfit(outfitId) {
    if (confirm("Are you sure you want to delete this outfit?")) {
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem("users")) || []

      // Find current user in users array
      const userIndex = users.findIndex((u) => u.id === currentUser.id)

      if (userIndex === -1) {
        alert("User not found. Please login again.")
        return
      }

      // Filter out the outfit to delete
      users[userIndex].outfits = (users[userIndex].outfits || []).filter((outfit) => outfit.id !== outfitId)

      // Save updated users array to localStorage
      localStorage.setItem("users", JSON.stringify(users))

      // Reload combos
      loadCombos()
    }
  }

  // Helper function to capitalize first letter
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  // Filter buttons functionality
  if (filterButtons) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", function () {
        // Remove active class from all buttons
        filterButtons.forEach((btn) => btn.classList.remove("active"))

        // Add active class to clicked button
        this.classList.add("active")

        // Get category from data attribute
        const category = this.dataset.category

        // Load wardrobe with selected category
        loadWardrobe(category)
      })
    })
  }

  // Create outfit button functionality
  if (createOutfitBtn) {
    createOutfitBtn.addEventListener("click", () => {
      // Redirect to stylyz page for recommendations
      window.location.href = "stylyz.html"
    })
  }

  // Initialize wardrobe
  loadWardrobe()
})
