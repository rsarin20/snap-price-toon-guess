
// Simple encryption/decryption functions
function encrypt(text: string): string {
  // This is a simple XOR encryption - in a real app, use a proper encryption library
  const key = "PriceSnapEncryptionKey2025";
  let result = '';
  
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  
  // Convert to base64 for storage
  return btoa(result);
}

function decrypt(encryptedText: string): string {
  try {
    // Decode from base64
    const text = atob(encryptedText);
    const key = "PriceSnapEncryptionKey2025";
    let result = '';
    
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    
    return result;
  } catch (error) {
    console.error("Decryption error:", error);
    return "";
  }
}

// Store API key securely
export function storeApiKey(apiKey: string): void {
  try {
    const encryptedKey = encrypt(apiKey);
    localStorage.setItem('pricesnap_api_key', encryptedKey);
    console.log("API key stored securely");
  } catch (error) {
    console.error("Error storing API key:", error);
  }
}

// Retrieve API key securely
export async function getSecureApiKey(): Promise<string> {
  try {
    // First try to get from localStorage
    const encryptedKey = localStorage.getItem('pricesnap_api_key');
    
    if (encryptedKey) {
      return decrypt(encryptedKey);
    }
    
    // If not in localStorage, return the fallback key
    // Note: In a production app, we would prompt the user for their key
    // or handle this with server-side code
    return "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";
  } catch (error) {
    console.error("Error retrieving API key:", error);
    throw new Error("Failed to retrieve API key");
  }
}

// Clear stored API key
export function clearApiKey(): void {
  localStorage.removeItem('pricesnap_api_key');
}
