document.addEventListener("DOMContentLoaded", async () => {
  const uploadArea = document.getElementById("uploadArea");
  const imageUpload = document.getElementById("imageUpload");
  const processingMessage = document.getElementById("processingMessage");
  const processedImages = document.getElementById("processedImages");
  const actionButtons = document.getElementById("actionButtons");
  const addToWardrobeBtn = document.getElementById("addToWardrobeBtn");
  const recommendBtn = document.getElementById("recommendBtn");
  const styleToggle = document.getElementById("styleToggle");

  // Check if user is logged in
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    alert("Please login to use this feature.");
    window.location.href = "login.html";
    return;
  }

  // Initialize Teachable Machine model
  let model;
  let tmImage;
  
  try {
    // Load the Teachable Machine library from CDN
    if (typeof window.tmImage === 'undefined') {
      // Create script element to load tmImage
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8/dist/teachablemachine-image.min.js';
      script.onload = async () => {
        tmImage = window.tmImage;
        model = await loadModel();
        console.log("Model loaded successfully");
      };
      script.onerror = () => {
        console.error("Failed to load Teachable Machine library");
        alert("Failed to load required resources. Please try again later.");
      };
      document.body.appendChild(script);
    } else {
      tmImage = window.tmImage;
      model = await loadModel();
      console.log("Model loaded successfully");
    }
  } catch (error) {
    console.error("Error loading model:", error);
    alert("Failed to load the clothing recognition model. Please try again later.");
    return;
  }

  async function loadModel() {
    try {
      const modelURL = "./model.json";
      const metadataURL = "./metadata.json";
      return await tmImage.load(modelURL, metadataURL);
    } catch (error) {
      console.error("Failed to load model files:", error);
      throw error;
    }
  }

  // Handle click on upload area
  if (uploadArea) {
    uploadArea.addEventListener("click", () => {
      imageUpload.click()
    })
  }

  // Handle drag and drop
  if (uploadArea) {
    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault()
      uploadArea.classList.add("dragover")
    })

    uploadArea.addEventListener("dragleave", () => {
      uploadArea.classList.remove("dragover")
    })

    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault()
      uploadArea.classList.remove("dragover")

      if (e.dataTransfer.files.length) {
        handleFiles(e.dataTransfer.files)
      }
    })
  }

  // Handle file selection
  if (imageUpload) {
    imageUpload.addEventListener("change", function () {
      if (this.files.length) {
        handleFiles(this.files)
      }
    })
  }

  // Process the selected files
  async function handleFiles(files) {
    console.log("Files received for processing:", files); // Debug log
    processingMessage.style.display = "flex";
    actionButtons.classList.add("hidden");
    processedImages.innerHTML = "";

    try {
        for (const file of Array.from(files)) {
            if (!file.type.match("image.*")) {
                console.warn("Skipping non-image file:", file.name);
                continue;
            }
            console.log(`Processing file ${file.name}...`); // Debug log
            await processSingleFile(file);
        }
    } catch (error) {
        console.error("Error in handleFiles:", error);
    } finally {
        processingMessage.style.display = "none";
        if (processedImages.children.length > 0) {
            actionButtons.classList.remove("hidden");
        }
    }
}

async function processSingleFile(file) {
  console.log("Processing file:", file.name); // Debug
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = async () => {
        try {
          // Debug: Log image loaded
          console.log("Image loaded, dimensions:", img.width, "x", img.height);

          // 1. Classify clothing type
          const prediction = await model.predict(img);
          const topPrediction = prediction.sort((a, b) => b.probability - a.probability)[0];
          const clothingType = topPrediction.className.toLowerCase();
          console.log("Clothing type:", clothingType);

          // 2. Get dominant color
          const rgb = await getDominantColor(img);
          console.log("Dominant RGB:", rgb);

          // 3. Get color NAME (key fix)
          const colorName = await getExactColorName(rgb); // Make sure this is awaited!
          console.log("Color name from Gemini/chroma:", colorName);

          // 4. Create UI element
          createProcessedImage(
            e.target.result,
            file.name,
            clothingType,
            rgb,
            colorName // Pass the name directly
          );
          resolve();
        } catch (error) {
          console.error("Error in processSingleFile:", error);
          reject(error);
        }
      };
    };
    reader.readAsDataURL(file);
  });
}

  // Function to get dominant color from image
  async function getDominantColor(img) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
    // Sample 50x50px from center
    const centerX = Math.floor(canvas.width / 2);
    const centerY = Math.floor(canvas.height / 2);
    const size = 50;
    const x = Math.max(0, centerX - size / 2);
    const y = Math.max(0, centerY - size / 2);
    const imageData = ctx.getImageData(x, y, size, size).data;
  
    // Calculate average RGB
    let r = 0, g = 0, b = 0;
    for (let i = 0; i < imageData.length; i += 4) {
      r += imageData[i];
      g += imageData[i + 1];
      b += imageData[i + 2];
    }
    const pixelCount = size * size;
    return {
      r: Math.round(r / pixelCount),
      g: Math.round(g / pixelCount),
      b: Math.round(b / pixelCount)
    };
  }

// Enhanced color naming function


  // Update the createProcessedImage function to add verification UI
  function createProcessedImage(src, name, category, rgb, colorName) {
    const imageContainer = document.createElement("div");
    imageContainer.className = "processed-image";
    imageContainer.dataset.category = category;
    imageContainer.dataset.colorName = colorName; // Store the NAME
  
    const img = document.createElement("img");
    img.src = src;
    img.alt = name;
    img.dataset.name = `${colorName} ${category}`; // e.g., "red shirt"
  
    const infoOverlay = document.createElement("div");
    infoOverlay.className = "image-info-overlay";
    infoOverlay.innerHTML = `
      <span class="info-text">${colorName} ${category}</span> <!-- Display NAME -->
      <button class="edit-info-btn"><i class="fas fa-edit"></i></button>
    `;
  
    imageContainer.appendChild(img);
    imageContainer.appendChild(infoOverlay);
    processedImages.appendChild(imageContainer);
  

    const removeBtn = document.createElement("button")
    removeBtn.className = "remove-image"
    removeBtn.innerHTML = '<i class="fas fa-times"></i>'
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      imageContainer.remove()

      // Hide action buttons if no images left
      if (processedImages.children.length === 0) {
        actionButtons.classList.add("hidden")
      }
    })

    // Add edit button functionality
    const editBtn = infoOverlay.querySelector(".edit-info-btn")
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      showEditModal(imageContainer, img, colorName, category)
    })

    imageContainer.appendChild(img)
    imageContainer.appendChild(infoOverlay)
    imageContainer.appendChild(removeBtn)
    processedImages.appendChild(imageContainer)
  }

  // Add function to show edit modal for clothing info
  function showEditModal(imageContainer, img, colorName, category) {
    // Create modal for editing
    const modalOverlay = document.createElement("div")
    modalOverlay.className = "modal-overlay"

    const modalContent = document.createElement("div")
    modalContent.className = "modal-content edit-modal"

    const modalHeader = document.createElement("div")
    modalHeader.className = "modal-header"
    modalHeader.innerHTML = `
      <h2>Edit Clothing Information</h2>
      <button class="modal-close"><i class="fas fa-times"></i></button>
    `

    const modalBody = document.createElement("div")
    modalBody.className = "modal-body"

    // Create form for editing
    modalBody.innerHTML = `
      <div class="edit-image-container">
        <img src="${img.src}" alt="Clothing item">
      </div>
      <div class="edit-form">
        <div class="form-group">
          <label for="editCategory">Clothing Type:</label>
          <select id="editCategory" class="edit-input">
            <option value="shirt" ${category === "shirt" ? "selected" : ""}>Shirt</option>
            <option value="tshirt" ${category === "tshirt" ? "selected" : ""}>T-Shirt</option>
            <option value="pants" ${category === "pants" ? "selected" : ""}>Pants</option>
            <option value="jacket" ${category === "jacket" ? "selected" : ""}>Jacket</option>
            <option value="shoes" ${category === "shoes" ? "selected" : ""}>Shoes</option>
            <option value="accessories" ${category === "accessories" ? "selected" : ""}>Accessories</option>
          </select>
        </div>
        <div class="form-group">
          <label for="editColor">Color:</label>
          <input type="text" id="editColor" class="edit-input" value="${colorName}">
        </div>
        <button id="saveChangesBtn" class="action-button">Save Changes</button>
      </div>
    `

    // Assemble modal
    modalContent.appendChild(modalHeader)
    modalContent.appendChild(modalBody)
    modalOverlay.appendChild(modalContent)
    document.body.appendChild(modalOverlay)

    // Add event listeners
    const closeBtn = modalHeader.querySelector(".modal-close")
    closeBtn.addEventListener("click", () => {
      document.body.removeChild(modalOverlay)
    })

    const saveChangesBtn = modalBody.querySelector("#saveChangesBtn")
    saveChangesBtn.addEventListener("click", () => {
      // Get updated values
      const newCategory = modalBody.querySelector("#editCategory").value
      const newColor = modalBody.querySelector("#editColor").value

      // Update the image container and dataset
      imageContainer.dataset.category = newCategory
      imageContainer.dataset.colorName = newColor

      // Update the display name
      img.dataset.name = `${newColor} ${newCategory}`
      const infoText = imageContainer.querySelector(".info-text")
      if (infoText) {
        infoText.textContent = `${newColor} ${newCategory}`
      }

      // Close the modal
      document.body.removeChild(modalOverlay)
    })
  }

  // Add to wardrobe button functionality
  if (addToWardrobeBtn) {
    addToWardrobeBtn.addEventListener("click", () => {
      const images = processedImages.querySelectorAll(".processed-image");
      
      if (images.length === 0) {
        alert("No items to add to wardrobe.");
        return;
      }
  
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const userIndex = users.findIndex((u) => u.id === currentUser.id);
  
      if (userIndex === -1) {
        alert("User not found. Please login again.");
        return;
      }
  
      // Initialize wardrobe array if it doesn't exist
      if (!users[userIndex].wardrobe) {
        users[userIndex].wardrobe = [];
      }
  
      // Add each image to wardrobe
      images.forEach((container) => {
        const img = container.querySelector("img");
        const item = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          name: img.dataset.name || "Unnamed item",
          image: img.src,
          category: container.dataset.category || "unknown",
          colorName: container.dataset.colorName || "unknown",
          dateAdded: new Date().toISOString()
        };
        users[userIndex].wardrobe.push(item);
      });
  
      // Save to localStorage
      localStorage.setItem("users", JSON.stringify(users));
      
      // Clear processed images
      processedImages.innerHTML = "";
      actionButtons.classList.add("hidden");
      
      // Redirect to wardrobe page
      window.location.href = "wardrobe.html";
    });
  }

  // Recommend outfits button functionality
  if (recommendBtn) {
    recommendBtn.addEventListener("click", async () => {
      console.log("Recommend button clicked")

      // Get the selected style preference
      const stylePreference = styleToggle.value || "casual"
      console.log("Style preference:", stylePreference)

      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem("users")) || []
      const currentUser = JSON.parse(localStorage.getItem("currentUser"))

      // Find current user in users array
      const userIndex = users.findIndex((u) => u.id === currentUser.id)

      if (userIndex === -1) {
        alert("User not found. Please login again.")
        return
      }

      // Get user's wardrobe
      const wardrobe = users[userIndex].wardrobe || []
      console.log("User wardrobe:", wardrobe)

      if (wardrobe.length < 2) {
        alert("You need at least 2 items in your wardrobe for recommendations.")
        return
      }

      // Show loading indicator
      const loadingModal = document.createElement("div")
      loadingModal.className = "modal-overlay"
      loadingModal.innerHTML = `
        <div class="loading-container">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Generating outfit recommendations...</p>
        </div>
      `
      document.body.appendChild(loadingModal)

      try {
        // Get outfit recommendations
        console.log("Generating outfit recommendations...")
        const recommendations = await generateOutfitRecommendations(wardrobe, stylePreference)
        console.log("Received recommendations:", recommendations)

        // Remove loading indicator
        document.body.removeChild(loadingModal)

        if (!recommendations || recommendations.length === 0) {
          alert("No recommendations could be generated. Please try again.")
          return
        }

        // Show recommendations in a modal
        console.log("Creating recommendation modal...")
        showRecommendationModal(recommendations, (outfit) => {
          console.log("Saving outfit:", outfit)
          // Save the outfit to the user's combos
          if (!users[userIndex].outfits) {
            users[userIndex].outfits = []
          }

          users[userIndex].outfits.push(outfit)
          localStorage.setItem("users", JSON.stringify(users))
          alert("Outfit saved to My Combos!")
        })
      } catch (error) {
        console.error("Error getting recommendations:", error)

        // Remove loading indicator
        document.body.removeChild(loadingModal)

        // Show error message
        alert("Failed to generate recommendations. Error: " + error.message)
      }
    })
  }

  // Function to generate outfit recommendations
  async function generateOutfitRecommendations(wardrobe, stylePreference) {
    // Validate input
    if (!wardrobe?.length) return [];
    
    // Ensure all items have color data
    const validItems = wardrobe.map(item => ({
      ...item,
      color: item.color || { r: 128, g: 128, b: 128 } // Default gray
    }));
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Separate items by category
    const tops = wardrobe.filter((item) => item.category === "shirt" || item.category === "tshirt")

    const bottoms = wardrobe.filter((item) => item.category === "pants")

    const jackets = wardrobe.filter((item) => item.category === "jacket")

    // Check if we have enough items
    if (tops.length === 0 || bottoms.length === 0) {
      return [
        {
          id: "no-match-" + Date.now(),
          name: "No Complete Outfit",
          description: "Your wardrobe needs at least one top and one bottom for a complete outfit.",
          items: [],
          dateCreated: new Date().toISOString(),
        },
      ]
    }

    // Generate recommendations based on style preference
    const recommendations = []

    // For casual style
    if (stylePreference === "casual") {
      // Try to create outfits with t-shirts
      const tshirts = tops.filter((item) => item.category === "tshirt")

      if (tshirts.length > 0) {
        for (let i = 0; i < Math.min(2, tshirts.length); i++) {
          for (let j = 0; j < Math.min(2, bottoms.length); j++) {
            const outfit = {
              id: `casual-${Date.now()}-${i}-${j}`,
              name: "Casual Outfit",
              description: `${tshirts[i].colorName} ${tshirts[i].category} with ${bottoms[j].colorName} ${bottoms[j].category}`,
              items: [tshirts[i], bottoms[j]],
              dateCreated: new Date().toISOString(),
            }

            // Add a jacket if available and it's a good match
            if (jackets.length > 0) {
              // Find a jacket that complements the outfit
              const matchingJacket = findComplementaryItem(tshirts[i], jackets)
              if (matchingJacket) {
                outfit.items.push(matchingJacket)
                outfit.description += ` and ${matchingJacket.colorName} ${matchingJacket.category}`
              }
            }

            recommendations.push(outfit)
          }
        }
      }
    }
    // For professional style
    else if (stylePreference === "professional") {
      // Try to create outfits with shirts
      const shirts = tops.filter((item) => item.category === "shirt")

      if (shirts.length > 0) {
        for (let i = 0; i < Math.min(2, shirts.length); i++) {
          for (let j = 0; j < Math.min(2, bottoms.length); j++) {
            const outfit = {
              id: `professional-${Date.now()}-${i}-${j}`,
              name: "Professional Outfit",
              description: `${shirts[i].colorName} ${shirts[i].category} with ${bottoms[j].colorName} ${bottoms[j].category}`,
              items: [shirts[i], bottoms[j]],
              dateCreated: new Date().toISOString(),
            }

            // Add a jacket for professional look
            if (jackets.length > 0) {
              // Find a jacket that complements the outfit
              const matchingJacket = findComplementaryItem(shirts[i], jackets)
              if (matchingJacket) {
                outfit.items.push(matchingJacket)
                outfit.description += ` and ${matchingJacket.colorName} ${matchingJacket.category}`
              }
            }

            recommendations.push(outfit)
          }
        }
      }
    }

    // If no specific style recommendations were created, create generic ones
    if (recommendations.length === 0) {
      for (let i = 0; i < Math.min(2, tops.length); i++) {
        for (let j = 0; j < Math.min(2, bottoms.length); j++) {
          const outfit = {
            id: `outfit-${Date.now()}-${i}-${j}`,
            name: "Outfit Combination",
            description: `${tops[i].colorName} ${tops[i].category} with ${bottoms[j].colorName} ${bottoms[j].category}`,
            items: [tops[i], bottoms[j]],
            dateCreated: new Date().toISOString(),
          }

          recommendations.push(outfit)
        }
      }
    }

    return recommendations
  }

  // Function to find complementary items based on color
  function findComplementaryItem(baseItem, items) {
    // Add validation
    if (!baseItem?.color || !items?.length) return items[0] || null;
  
    try {
      const baseHsv = rgbToHsv(
        baseItem.color.r,
        baseItem.color.g,
        baseItem.color.b
      );

    // Find items with complementary colors
    for (const item of items) {
      const itemHsv = rgbToHsv(item.color.r, item.color.g, item.color.b)

      // Check for complementary colors (opposite on color wheel)
      const hueDiff = Math.abs(baseHsv.h - itemHsv.h)
      const isComplementary = hueDiff > 150 && hueDiff < 210 // 180° ± 30°

      // Check for similar colors
      const isSimilar =
        (hueDiff < 30 || hueDiff > 330) &&
        Math.abs(baseHsv.s - itemHsv.s) < 0.3 &&
        Math.abs(baseHsv.v - itemHsv.v) < 0.3

      // Check for monochromatic
      const isMonochromatic = hueDiff < 15 && Math.abs(baseHsv.s - itemHsv.s) < 0.2

      if (isComplementary || isSimilar || isMonochromatic) {
        return item
      }
    }

    // If no good match, return the first item
    return items[0]
  }
   catch (error) {
    console.error("Color analysis failed, using random item:", error);
    return items[0] || null;
  }
}

  // RGB to HSV conversion
  function rgbToHsv(r, g, b) {
    ;(r /= 255), (g /= 255), (b /= 255)
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b)
    let h,
      s,
      v = max

    const d = max - min
    s = max === 0 ? 0 : d / max

    if (max === min) {
      h = 0 // achromatic
    } else {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }

    return { h: h * 360, s, v }
  }

  // Function to display recommendations in a modal
  function showRecommendationModal(recommendations, saveOutfitCallback) {
    // Create modal overlay
    const modalOverlay = document.createElement("div")
    modalOverlay.className = "modal-overlay"

    // Create modal content
    const modalContent = document.createElement("div")
    modalContent.className = "modal-content recommendation-modal"

    // Create modal header
    const modalHeader = document.createElement("div")
    modalHeader.className = "modal-header"
    modalHeader.innerHTML = `
      <h2>Outfit Recommendations</h2>
      <button class="modal-close"><i class="fas fa-times"></i></button>
    `

    // Create modal body
    const modalBody = document.createElement("div")
    modalBody.className = "modal-body"

    // Add recommendations to the modal
    if (recommendations.length === 0) {
      modalBody.innerHTML = `
        <div class="no-recommendations">
          <i class="fas fa-exclamation-circle"></i>
          <p>No recommendations could be generated. Try adding more items to your wardrobe.</p>
        </div>
      `
    } else {
      recommendations.forEach((recommendation, index) => {
        const outfitCard = document.createElement("div")
        outfitCard.className = "outfit-card"

        // Create outfit header
        const outfitHeader = document.createElement("div")
        outfitHeader.className = "outfit-header"
        outfitHeader.innerHTML = `
          <h3>${recommendation.name} #${index + 1}</h3>
        `

        // Create outfit description
        const outfitDescription = document.createElement("p")
        outfitDescription.className = "outfit-description"
        outfitDescription.textContent = recommendation.description

        // Create outfit items container
        const outfitItems = document.createElement("div")
        outfitItems.className = "outfit-items"

        // Add each item to the container
        if (recommendation.items && recommendation.items.length > 0) {
          recommendation.items.forEach((item) => {
            const itemElement = document.createElement("div")
            itemElement.className = "outfit-item"

            const itemImg = document.createElement("img")
            itemImg.src = item.image
            itemImg.alt = item.name

            const itemName = document.createElement("p")
            itemName.textContent = item.name

            itemElement.appendChild(itemImg)
            itemElement.appendChild(itemName)
            outfitItems.appendChild(itemElement)
          })
        } else {
          outfitItems.innerHTML = `<p class="no-items">No specific items matched</p>`
        }

        // Create save button
        const saveButton = document.createElement("button")
        saveButton.className = "action-button"
        saveButton.innerHTML = '<i class="fas fa-heart"></i> Save to My Combos'
        saveButton.addEventListener("click", () => {
          saveOutfitCallback(recommendation)
          saveButton.disabled = true
          saveButton.innerHTML = '<i class="fas fa-check"></i> Saved!'
        })

        // Assemble outfit card
        outfitCard.appendChild(outfitHeader)
        outfitCard.appendChild(outfitDescription)
        outfitCard.appendChild(outfitItems)
        outfitCard.appendChild(saveButton)

        // Add to modal body
        modalBody.appendChild(outfitCard)
      })
    }

    // Create close button
    const closeButton = document.createElement("button")
    closeButton.className = "action-button close-button"
    closeButton.innerHTML = '<i class="fas fa-times"></i> Close'
    closeButton.addEventListener("click", () => {
      document.body.removeChild(modalOverlay)
    })
    modalBody.appendChild(closeButton)

    // Assemble modal
    modalContent.appendChild(modalHeader)
    modalContent.appendChild(modalBody)
    modalOverlay.appendChild(modalContent)

    // Add to document
    document.body.appendChild(modalOverlay)

    // Add event listener to close button in header
    const closeBtn = modalHeader.querySelector(".modal-close")
    closeBtn.addEventListener("click", () => {
      document.body.removeChild(modalOverlay)
    })
  }
})

console.log("Stylyz.js loaded successfully")
