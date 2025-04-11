
import { PredictionResult } from '../types/prediction';
import { mockPriceDatabase, mockManufacturingCostPercentage, mockImportLocations, categorizeProduct } from '../data/mockData';

// Fallback function using transformers.js for when OpenAI API fails
export async function fallbackPrediction(imageData: string): Promise<PredictionResult> {
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
      // Safely access properties using type checking
      const topResult = result[0];
      if (topResult && typeof topResult === 'object') {
        objectLabel = 'label' in topResult ? String(topResult.label) : '';
        confidenceScore = 'score' in topResult ? Number(topResult.score) : 0;
      }
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
