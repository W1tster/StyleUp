// Add console logging to help debug
console.log("Recommendation modal module loaded")

// Create and manage the recommendation modal
function createRecommendationModal(recommendations, onSaveOutfit) {
  console.log("Creating recommendation modal with:", recommendations)
  // Create modal container
  const modalOverlay = document.createElement("div")
  modalOverlay.className = "modal-overlay"

  const modalContent = document.createElement("div")
  modalContent.className = "modal-content"

  // Create modal header
  const modalHeader = document.createElement("div")
  modalHeader.className = "modal-header"

  const modalTitle = document.createElement("h2")
  modalTitle.textContent = "Your Outfit Recommendations"

  const closeButton = document.createElement("button")
  closeButton.className = "modal-close"
  closeButton.innerHTML = '<i class="fas fa-times"></i>'
  closeButton.addEventListener("click", () => {
    document.body.removeChild(modalOverlay)
  })

  modalHeader.appendChild(modalTitle)
  modalHeader.appendChild(closeButton)

  // Create modal body
  const modalBody = document.createElement("div")
  modalBody.className = "modal-body"

  // Add recommendations to modal
  if (recommendations && recommendations.length > 0) {
    recommendations.forEach((outfit, index) => {
      const outfitCard = document.createElement("div")
      outfitCard.className = "outfit-card"

      // Outfit header with number
      const outfitHeader = document.createElement("div")
      outfitHeader.className = "outfit-header"
      outfitHeader.innerHTML = `<h3>Outfit ${index + 1}</h3>`

      // Outfit description
      const outfitDesc = document.createElement("p")
      outfitDesc.className = "outfit-description"
      outfitDesc.textContent = outfit.description

      // Outfit items grid
      const outfitItems = document.createElement("div")
      outfitItems.className = "outfit-items"

      // Add items to the grid
      if (outfit.items && outfit.items.length > 0) {
        outfit.items.forEach((item) => {
          const itemElement = document.createElement("div")
          itemElement.className = "outfit-item"

          const itemImage = document.createElement("img")
          itemImage.src = item.image
          itemImage.alt = item.name

          const itemName = document.createElement("p")
          itemName.textContent = item.name

          itemElement.appendChild(itemImage)
          itemElement.appendChild(itemName)
          outfitItems.appendChild(itemElement)
        })
      } else {
        // If no items matched, show a message
        const noItems = document.createElement("p")
        noItems.className = "no-items"
        noItems.textContent = "No specific items matched. Add more items to your wardrobe for better recommendations."
        outfitItems.appendChild(noItems)
      }

      // Save button
      const saveButton = document.createElement("button")
      saveButton.className = "action-button"
      saveButton.innerHTML = '<i class="fas fa-heart"></i> Save to My Combos'
      saveButton.addEventListener("click", () => {
        onSaveOutfit(outfit)
        saveButton.disabled = true
        saveButton.innerHTML = '<i class="fas fa-check"></i> Saved'
      })

      // Assemble outfit card
      outfitCard.appendChild(outfitHeader)
      outfitCard.appendChild(outfitDesc)
      outfitCard.appendChild(outfitItems)
      outfitCard.appendChild(saveButton)

      modalBody.appendChild(outfitCard)
    })
  } else {
    // If no recommendations, show a message
    const noRecommendations = document.createElement("div")
    noRecommendations.className = "no-recommendations"
    noRecommendations.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <p>We couldn't generate recommendations at this time. Please try again later or add more items to your wardrobe.</p>
    `
    modalBody.appendChild(noRecommendations)
  }

  // Assemble modal
  modalContent.appendChild(modalHeader)
  modalContent.appendChild(modalBody)
  modalOverlay.appendChild(modalContent)

  // Add modal to the document
  document.body.appendChild(modalOverlay)

  // Return the modal element for potential further manipulation
  return modalOverlay
}
