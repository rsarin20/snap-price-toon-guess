
interface PredictionResult {
  objectName: string;
  price: string;
  manufacturingCost: string;
  importLocation: string;
  confidence: number;
}

// Fallback mock prices for when OpenAI API is unavailable
const mockPriceDatabase: Record<string, { minPrice: number; maxPrice: number }> = {
  "laptop": { minPrice: 800, maxPrice: 2000 },
  "smartphone": { minPrice: 400, maxPrice: 1200 },
  "headphones": { minPrice: 50, maxPrice: 350 },
  "watch": { minPrice: 100, maxPrice: 500 },
  "television": { minPrice: 300, maxPrice: 2500 },
  "camera": { minPrice: 200, maxPrice: 1500 },
  "keyboard": { minPrice: 20, maxPrice: 200 },
  "mouse": { minPrice: 10, maxPrice: 150 },
  "monitor": { minPrice: 150, maxPrice: 800 },
  "tablet": { minPrice: 200, maxPrice: 1000 },
  "book": { minPrice: 10, maxPrice: 50 },
  "chair": { minPrice: 50, maxPrice: 300 },
  "table": { minPrice: 100, maxPrice: 1000 },
  "lamp": { minPrice: 20, maxPrice: 200 },
  "backpack": { minPrice: 30, maxPrice: 150 },
  "shoes": { minPrice: 40, maxPrice: 200 },
  "jacket": { minPrice: 50, maxPrice: 300 },
  "bottle": { minPrice: 5, maxPrice: 50 },
  "sunglasses": { minPrice: 15, maxPrice: 300 },
  "handbag": { minPrice: 30, maxPrice: 500 },
};

// Mock manufacturing cost percentages (of retail price)
const mockManufacturingCostPercentage: Record<string, { min: number; max: number }> = {
  "electronics": { min: 30, max: 60 },
  "clothing": { min: 15, max: 40 },
  "furniture": { min: 25, max: 50 },
  "toys": { min: 20, max: 45 },
  "kitchenware": { min: 25, max: 50 },
  "tools": { min: 35, max: 65 },
  "default": { min: 25, max: 50 }
};

// Mock import locations by product category
const mockImportLocations: Record<string, string[]> = {
  "electronics": ["China", "Taiwan", "South Korea", "Japan", "Vietnam"],
  "clothing": ["Bangladesh", "Vietnam", "China", "India", "Indonesia"],
  "furniture": ["China", "Vietnam", "Mexico", "Malaysia", "Poland"],
  "toys": ["China", "Vietnam", "Mexico", "Indonesia", "Thailand"],
  "kitchenware": ["China", "India", "Thailand", "Turkey", "Italy"],
  "tools": ["China", "Taiwan", "Germany", "USA", "Mexico"],
  "default": ["China", "Vietnam", "India", "Mexico", "USA"]
};

// Helper function to categorize products
function categorizeProduct(objectName: string): string {
  const electronics = ["laptop", "smartphone", "headphones", "television", "camera", "monitor", "tablet"];
  const clothing = ["shoes", "jacket", "handbag", "sunglasses", "backpack"];
  const furniture = ["chair", "table", "lamp"];
  const toys = ["toy", "game", "doll", "figurine"];
  const kitchenware = ["bottle", "cup", "plate", "pot", "pan"];
  const tools = ["keyboard", "mouse", "tool"];

  if (electronics.some(item => objectName.includes(item))) return "electronics";
  if (clothing.some(item => objectName.includes(item))) return "clothing";
  if (furniture.some(item => objectName.includes(item))) return "furniture";
  if (toys.some(item => objectName.includes(item))) return "toys";
  if (kitchenware.some(item => objectName.includes(item))) return "kitchenware";
  if (tools.some(item => objectName.includes(item))) return "tools";
  
  return "default";
}

export async function predictPrice(imageData: string): Promise<PredictionResult> {
  try {
    // Remove the data URL prefix to get the base64 string
    const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, "");
    
    // Call OpenAI API for image analysis
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem("OPENAI_API_KEY")}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a professional product analyst. Analyze the image provided and identify the object, estimate its retail price in USD, manufacturing cost, and likely country of import. Be accurate and concise."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "What is this object? Provide the following in a JSON format: \n1. name: the object name\n2. price: estimated retail price in USD\n3. manufacturingCost: estimated manufacturing cost in USD\n4. importLocation: likely country of import\n5. confidence: a decimal between 0 and 1 representing your confidence level"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 300
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("OpenAI API response:", data);
    
    // Parse the response to extract the JSON data
    let jsonResponse = {};
    try {
      const content = data.choices[0].message.content;
      // Extract JSON from the response (it might be embedded in text)
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/\{[\s\S]*?\}/);
                        
      if (jsonMatch) {
        jsonResponse = JSON.parse(jsonMatch[0]);
      } else {
        // Try to parse the entire content as JSON
        jsonResponse = JSON.parse(content);
      }
      
      console.log("Parsed OpenAI response:", jsonResponse);
    } catch (err) {
      console.error("Error parsing OpenAI response:", err);
      // Fall back to local processing if JSON parsing fails
      return fallbackPrediction(imageData);
    }
    
    // Extract values from the parsed JSON
    const objectName = jsonResponse.name || "Unknown Object";
    const price = typeof jsonResponse.price === 'number' 
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(jsonResponse.price)
      : jsonResponse.price || "$99.99";
    const manufacturingCost = typeof jsonResponse.manufacturingCost === 'number'
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(jsonResponse.manufacturingCost)
      : jsonResponse.manufacturingCost || "$45.00";
    const importLocation = jsonResponse.importLocation || "Unknown";
    const confidence = jsonResponse.confidence || 0.8;

    return {
      objectName: objectName.charAt(0).toUpperCase() + objectName.slice(1),
      price,
      manufacturingCost,
      importLocation,
      confidence
    };
  } catch (error) {
    console.error("Error in OpenAI prediction:", error);
    // Fall back to local processing if there's an error with the OpenAI API
    return fallbackPrediction(imageData);
  }
}

// Fallback function using transformers.js for when OpenAI API fails
async function fallbackPrediction(imageData: string): Promise<PredictionResult> {
  try {
    console.log("Using fallback prediction with transformers.js");
    const { pipeline } = await import("@huggingface/transformers");
    
    // Configure transformers.js
    const config = {
      device: "webgpu" as const,
      allowLocalModels: false,
      useBrowserCache: true,
    };

    console.log("Loading image classification model...");
    
    // Create image classification pipeline with mobile-optimized model
    const classifier = await pipeline(
      "image-classification",
      "onnx-community/mobilenetv4_conv_small.e2400_r224_in1k",
      config
    );
    
    console.log("Model loaded, running inference...");
    
    // Run image classification
    const result = await classifier(imageData);
    console.log("Classification result:", result);

    // Get the top prediction
    let objectLabel = '';
    let confidenceScore = 0;
    
    if (Array.isArray(result) && result.length > 0) {
      objectLabel = result[0].label || '';
      confidenceScore = result[0].score || 0;
    } else {
      objectLabel = "Unknown Object";
      confidenceScore = 0.5;
    }
    
    let objectName = objectLabel.split(',')[0].trim();
    objectName = objectName.replace(/_/g, ' ').toLowerCase();
    
    console.log("Detected object:", objectName, "with confidence:", confidenceScore);
    
    // Get price range from database or generate a reasonable guess
    let priceRange = mockPriceDatabase[objectName.toLowerCase()];
    
    // If not in our database, create a random price range
    if (!priceRange) {
      priceRange = {
        minPrice: Math.round(20 + Math.random() * 180),
        maxPrice: Math.round(200 + Math.random() * 800)
      };
    }
    
    // Generate price within range, weighted by confidence
    const confidence = confidenceScore;
    const priceRange50 = (priceRange.maxPrice - priceRange.minPrice) * 0.5;
    const midPoint = priceRange.minPrice + priceRange50;
    
    // Add some randomness to make it interesting
    const randomFactor = Math.random() * priceRange50;
    const estimatedPrice = Math.round(midPoint + randomFactor);
    
    // Format the price
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(estimatedPrice);

    // Determine product category for manufacturing cost and import location
    const category = categorizeProduct(objectName);
    
    // Calculate manufacturing cost
    const costPercentage = mockManufacturingCostPercentage[category] || mockManufacturingCostPercentage.default;
    const costPercent = costPercentage.min + (Math.random() * (costPercentage.max - costPercentage.min));
    const manufacturingCost = estimatedPrice * (costPercent / 100);
    
    // Format the manufacturing cost
    const formattedManufacturingCost = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(manufacturingCost);

    // Determine likely import location
    const possibleLocations = mockImportLocations[category] || mockImportLocations.default;
    const importLocation = possibleLocations[Math.floor(Math.random() * possibleLocations.length)];
    
    return {
      objectName: objectName.charAt(0).toUpperCase() + objectName.slice(1),
      price: formattedPrice,
      manufacturingCost: formattedManufacturingCost,
      importLocation,
      confidence: confidence
    };
  } catch (error) {
    console.error("Error in fallback prediction:", error);
    
    // Ultimate fallback response in case of error
    return {
      objectName: "Unknown Object",
      price: "$99.99",
      manufacturingCost: "$45.00",
      importLocation: "Unknown",
      confidence: 0.5
    };
  }
}
