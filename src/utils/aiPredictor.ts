
import { PredictionResult } from './types/prediction';
import { predictWithOpenAI } from './api/openai';
import { fallbackPrediction } from './prediction/fallback';
import { storeApiKey } from './security/keyManager';

export async function predictPrice(imageData: string): Promise<PredictionResult> {
  try {
    console.log("Starting prediction process");
    // Remove the data URL prefix to get the base64 string
    const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, "");
    
    // Call OpenAI API for image analysis
    console.log("Calling OpenAI prediction");
    const result = await predictWithOpenAI(base64Image);
    console.log("OpenAI prediction successful:", result);
    return result;
  } catch (error) {
    console.error("Error in OpenAI prediction, falling back to local processing:", error);
    // Fall back to local processing if there's an error with the OpenAI API
    return fallbackPrediction(imageData);
  }
}

// Function to set a custom API key
export function setCustomApiKey(apiKey: string): boolean {
  if (apiKey && apiKey.trim() !== '') {
    storeApiKey(apiKey.trim());
    return true;
  }
  return false;
}
