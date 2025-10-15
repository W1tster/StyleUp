// Gemini API integration for outfit recommendations
const GEMINI_API_KEY = "API_KEY_HERE"

// Add console logging to help debug
console.log("Gemini API module loaded")

// Function to get outfit recommendations from Gemini API
async function getOutfitRecommendations(wardrobeItems, stylePreference) {
  console.log("Getting outfit recommendations...", wardrobeItems, stylePreference)
  try {
    // Build the prompt for Gemini
    let prompt = `Create 3 concise outfit combinations for a ${stylePreference} event using these clothing items:\n`

    // Add wardrobe items to the prompt
    wardrobeItems.forEach((item) => {
      prompt += `- ${item.name} (color: ${item.colorName || "unknown"})\n`
    })

    prompt += `
    Rules:
    1. Create exactly 3 outfit combinations
    2. Each outfit must include at least one bottom (pants, skirt, etc.)
    3. Each outfit must include at least one top (shirt, t-shirt, blouse, etc.)
    4. Include a jacket or outerwear if appropriate for the style
    5. Focus on color harmony and style consistency
    6. Format each outfit as a numbered list item
    7. Keep each suggestion under 15 words
    8. For ${stylePreference} style specifically
    `

    // Make the API request to Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()

    // Extract the text from the response
    const recommendationText = data.candidates[0].content.parts[0].text

    // Parse the recommendations into an array of outfit suggestions
    const outfits = parseRecommendations(recommendationText, wardrobeItems)

    return outfits
  } catch (error) {
    console.error("Error getting outfit recommendations:", error)
    return null
  }
}

// Function to parse the recommendation text into structured outfit data
function parseRecommendations(text, wardrobeItems) {
  // Split the text into lines and filter out empty lines
  const lines = text.split("\n").filter((line) => line.trim() !== "")

  // Extract outfit suggestions (lines that start with a number or bullet point)
  const outfitLines = lines.filter((line) => /^(\d+[.)]|\*|-)\s+/.test(line.trim()))

  // Process each outfit suggestion
  return outfitLines.map((line, index) => {
    // Remove the number/bullet at the beginning
    const outfitText = line.replace(/^(\d+[.)]|\*|-)\s+/, "").trim()

    // Create a unique ID for the outfit
    const outfitId = `outfit-${Date.now()}-${index}`

    // Try to match items from the wardrobe based on the text
    const matchedItems = findMatchingItems(outfitText, wardrobeItems)

    return {
      id: outfitId,
      description: outfitText,
      items: matchedItems,
      dateCreated: new Date().toISOString(),
    }
  })
}

// Function to find matching wardrobe items based on the outfit description
function findMatchingItems(outfitText, wardrobeItems) {
  const matchedItems = []
  const outfitTextLower = outfitText.toLowerCase()

  // For each wardrobe item, check if its name or category appears in the outfit text
  wardrobeItems.forEach((item) => {
    const itemName = item.name.toLowerCase()
    const itemCategory = item.category.toLowerCase()

    // Check if the item name or category is mentioned in the outfit text
    if (
      outfitTextLower.includes(itemName) ||
      outfitTextLower.includes(itemCategory) ||
      (item.colorName && outfitTextLower.includes(item.colorName.toLowerCase()))
    ) {
      // Add the item if it's not already in the matched items
      if (!matchedItems.some((matchedItem) => matchedItem.id === item.id)) {
        matchedItems.push(item)
      }
    }
  })

  // If we couldn't match specific items, make a best guess based on categories
  if (matchedItems.length === 0) {
    // Look for one bottom (pants, skirt, etc.)
    const bottom = wardrobeItems.find(
      (item) =>
        item.category.toLowerCase().includes("pants") ||
        item.category.toLowerCase().includes("skirt") ||
        item.category.toLowerCase().includes("bottom"),
    )

    // Look for one top (shirt, t-shirt, blouse, etc.)
    const top = wardrobeItems.find(
      (item) =>
        item.category.toLowerCase().includes("shirt") ||
        item.category.toLowerCase().includes("top") ||
        item.category.toLowerCase().includes("blouse"),
    )

    // Look for one outerwear (jacket, coat, etc.)
    const outerwear = wardrobeItems.find(
      (item) =>
        item.category.toLowerCase().includes("jacket") ||
        item.category.toLowerCase().includes("coat") ||
        item.category.toLowerCase().includes("outerwear"),
    )

    // Add the found items to the matched items
    if (bottom) matchedItems.push(bottom)
    if (top) matchedItems.push(top)
    if (outerwear && outfitTextLower.includes("jacket")) matchedItems.push(outerwear)
  }

  return matchedItems
}

// Add to gemini-api.js (reuse the same API key)
// Add to gemini-api.js
async function getExactColorName(rgb) {
  console.log("Getting color name for RGB:", rgb);
  try {
    const prompt = `Give me the exact name for this color (RGB: ${rgb.r},${rgb.g},${rgb.b}). 
    Respond ONLY with the color name in lowercase (e.g., "burgundy", "peach"). No hex codes or additional text.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!response.ok) throw new Error(`Color API failed: ${response.status}`);
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim().toLowerCase();
  } catch (error) {
    console.error("Gemini failed. Falling back to chroma.js...");
    return getSimpleColorName(rgb); // Fallback to chroma.js
  }
}

// Fallback function using chroma.js
function getSimpleColorName(rgb) {
  try {
    const color = chroma(rgb.r, rgb.g, rgb.b);
    // Map hex to closest named color if .name() fails
    return color.name() || closestNamedColor(color.hex());
  } catch (e) {
    return "unknown";
  }
}

async function testGemini() {
  const testRGB = { r: 255, g: 0, b: 0 };
  const name = await getExactColorName(testRGB);
  console.log("Gemini test result:", name); // Should log "red" or similar
}
testGemini();