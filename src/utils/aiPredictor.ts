
import { PredictionResult } from './types/prediction';
import { predictWithOpenAI } from './api/openai';
import { fallbackPrediction } from './prediction/fallback';

export async function predictPrice(imageData: string): Promise<PredictionResult> {
  try {
    // Remove the data URL prefix to get the base64 string
    const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, "");
    
    // Call OpenAI API for image analysis
    return await predictWithOpenAI(base64Image);
  } catch (error) {
    console.error("Error in OpenAI prediction:", error);
    // Fall back to local processing if there's an error with the OpenAI API
    return fallbackPrediction(imageData);
  }
}
