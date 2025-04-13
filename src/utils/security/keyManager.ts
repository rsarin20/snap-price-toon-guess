
// Retrieve API key from environment variables
export async function getSecureApiKey(): Promise<string> {
  try {
    // First try to get from environment variables
    const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (envApiKey) {
      console.log("Using API key from environment variables");
      return envApiKey;
    }
    
    // Fallback key if environment variable is not set
    console.warn("Environment variable VITE_OPENAI_API_KEY is not set, using fallback key");
    return "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";
  } catch (error) {
    console.error("Error retrieving API key:", error);
    throw new Error("Failed to retrieve API key");
  }
}

// Store API key - this function is kept for backwards compatibility
// but we're now preferring environment variables
export function storeApiKey(apiKey: string): void {
  console.warn("Storing API keys in localStorage is deprecated. Please use environment variables instead.");
  // No action taken as we're moving to environment variables
}

// Clear stored API key - kept for backwards compatibility
export function clearApiKey(): void {
  console.warn("API keys are now managed via environment variables");
}
