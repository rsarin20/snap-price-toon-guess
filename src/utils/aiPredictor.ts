
import { pipeline } from "@huggingface/transformers";

interface PredictionResult {
  objectName: string;
  price: string;
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

export async function predictPrice(imageData: string): Promise<PredictionResult> {
  try {
    // Configure transformers.js
    const config = {
      device: "webgpu", // Use WebGPU acceleration if available
      allowLocalModels: false, // Load models from HF hub
      useBrowserCache: true, // Cache models in browser
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
    const topPrediction = result[0];
    
    // Clean up prediction label (remove categories, etc.)
    let objectName = topPrediction.label.split(',')[0].trim();
    objectName = objectName.replace(/_/g, ' ').toLowerCase();
    
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
    const confidence = topPrediction.score;
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
    
    return {
      objectName: objectName.charAt(0).toUpperCase() + objectName.slice(1),
      price: formattedPrice,
      confidence: confidence
    };
  } catch (error) {
    console.error("Error in AI prediction:", error);
    
    // Fallback response in case of error
    return {
      objectName: "Unknown Object",
      price: "$99.99",
      confidence: 0.5
    };
  }
}
