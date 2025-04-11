
// Fallback mock prices for when OpenAI API is unavailable
export const mockPriceDatabase: Record<string, { minPrice: number; maxPrice: number }> = {
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
export const mockManufacturingCostPercentage: Record<string, { min: number; max: number }> = {
  "electronics": { min: 30, max: 60 },
  "clothing": { min: 15, max: 40 },
  "furniture": { min: 25, max: 50 },
  "toys": { min: 20, max: 45 },
  "kitchenware": { min: 25, max: 50 },
  "tools": { min: 35, max: 65 },
  "default": { min: 25, max: 50 }
};

// Mock import locations by product category
export const mockImportLocations: Record<string, string[]> = {
  "electronics": ["China", "Taiwan", "South Korea", "Japan", "Vietnam"],
  "clothing": ["Bangladesh", "Vietnam", "China", "India", "Indonesia"],
  "furniture": ["China", "Vietnam", "Mexico", "Malaysia", "Poland"],
  "toys": ["China", "Vietnam", "Mexico", "Indonesia", "Thailand"],
  "kitchenware": ["China", "India", "Thailand", "Turkey", "Italy"],
  "tools": ["China", "Taiwan", "Germany", "USA", "Mexico"],
  "default": ["China", "Vietnam", "India", "Mexico", "USA"]
};

// Helper function to categorize products
export function categorizeProduct(objectName: string): string {
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
