
import { pipeline } from "@huggingface/transformers";

interface PredictionResult {
  objectName: string;
  price: string;
  manufacturingCost: string;
  importLocation: string;
  confidence: number;
}

// Mock prices for testing - in a real app this would be replaced with a more sophisticated model
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
    } else if (result && typeof result === 'object') {
      // Handle different possible response formats
      const firstResult = Array.isArray((result as any).results) ? 
        (result as any).results[0] : result;
      
      objectLabel = firstResult.label || '';
      confidenceScore = firstResult.score || 0;
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
    
    // TODO: In a production app, you would send the image to OpenAI API here 
    // and use their vision capabilities to get more accurate results
    
    return {
      objectName: objectName.charAt(0).toUpperCase() + objectName.slice(1),
      price: formattedPrice,
      manufacturingCost: formattedManufacturingCost,
      importLocation,
      confidence: confidence
    };
  } catch (error) {
    console.error("Error in AI prediction:", error);
    
    // Fallback response in case of error
    return {
      objectName: "Unknown Object",
      price: "$99.99",
      manufacturingCost: "$45.00",
      importLocation: "Unknown",
      confidence: 0.5
    };
  }
}
