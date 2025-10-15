document.addEventListener("DOMContentLoaded", () => {
  const seasonTabs = document.querySelectorAll(".season-tab")
  const seasonContent = document.getElementById("seasonContent")
  const recommendedOutfits = document.getElementById("recommendedOutfits")
  const runwayLoginPrompt = document.getElementById("runwayLoginPrompt")

  // Check if user is logged in
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  // Season tabs functionality
  if (seasonTabs) {
    seasonTabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        // Remove active class from all tabs
        seasonTabs.forEach((t) => t.classList.remove("active"))

        // Add active class to clicked tab
        this.classList.add("active")

        // Get season from data attribute
        const season = this.dataset.season

        // Load season content
        loadSeasonContent(season)
      })
    })
  }

  // Load season content
  function loadSeasonContent(season) {
    // Clear previous content
    seasonContent.innerHTML = ""

    // Create season grid
    const seasonGrid = document.createElement("div")
    seasonGrid.className = "season-grid"
    seasonGrid.dataset.season = season

    // Add season items based on selected season
    let items = []

    switch (season) {
      case "spring":
        items = [
          { image: "/placeholder.svg?height=250&width=180", title: "Floral Patterns" },
          { image: "/placeholder.svg?height=250&width=180", title: "Light Layers" },
          { image: "/placeholder.svg?height=250&width=180", title: "Pastel Colors" },
        ]
        break
      case "summer":
        items = [
          { image: "/placeholder.svg?height=250&width=180", title: "Linen Shirts" },
          { image: "/placeholder.svg?height=250&width=180", title: "Shorts & Skirts" },
          { image: "/placeholder.svg?height=250&width=180", title: "Bright Colors" },
        ]
        break
      case "fall":
        items = [
          { image: "/placeholder.svg?height=250&width=180", title: "Layered Looks" },
          { image: "/placeholder.svg?height=250&width=180", title: "Earth Tones" },
          { image: "/placeholder.svg?height=250&width=180", title: "Light Jackets" },
        ]
        break
      case "winter":
        items = [
          { image: "/placeholder.svg?height=250&width=180", title: "Cozy Sweaters" },
          { image: "/placeholder.svg?height=250&width=180", title: "Winter Coats" },
          { image: "/placeholder.svg?height=250&width=180", title: "Warm Accessories" },
        ]
        break
    }

    // Create and append items
    items.forEach((item) => {
      const itemElement = document.createElement("div")
      itemElement.className = "season-item"

      itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <h4>${item.title}</h4>
            `

      seasonGrid.appendChild(itemElement)
    })

    // Append season grid to content
    seasonContent.appendChild(seasonGrid)
  }

  // Load user recommendations if logged in
  function loadUserRecommendations() {
    if (!currentUser) {
      if (runwayLoginPrompt) runwayLoginPrompt.style.display = "block"
      return
    }

    // Hide login prompt
    if (runwayLoginPrompt) runwayLoginPrompt.style.display = "none"

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || []

    // Find current user in users array
    const userIndex = users.findIndex((u) => u.id === currentUser.id)

    if (userIndex === -1 || !users[userIndex].wardrobe || users[userIndex].wardrobe.length === 0) {
      // No wardrobe items, show message
      if (recommendedOutfits) {
        recommendedOutfits.innerHTML = `
                    <div class="empty-recommendations">
                        <p>Add items to your wardrobe to get personalized recommendations.</p>
                        <a href="stylyz.html" class="cta-button">Add Items Now</a>
                    </div>
                `
      }
      return
    }

    // Generate some sample recommendations based on user's wardrobe
    const recommendations = [
      { title: "Casual Day Out", image: "/placeholder.svg?height=250&width=180" },
      { title: "Office Ready", image: "/placeholder.svg?height=250&width=180" },
      { title: "Weekend Style", image: "/placeholder.svg?height=250&width=180" },
    ]

    // Display recommendations
    if (recommendedOutfits) {
      recommendedOutfits.innerHTML = ""

      recommendations.forEach((rec) => {
        const recElement = document.createElement("div")
        recElement.className = "outfit-card"

        recElement.innerHTML = `
                    <div class="outfit-image">
                        <img src="${rec.image}" alt="${rec.title}">
                    </div>
                    <h3>${rec.title}</h3>
                    <button class="view-outfit-btn">View Details</button>
                `

        recommendedOutfits.appendChild(recElement)
      })
    }
  }

  // Initialize
  loadSeasonContent("spring")
  loadUserRecommendations()
})

