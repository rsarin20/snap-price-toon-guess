
import { PredictionResult } from '../types/prediction';

export async function predictWithOpenAI(base64Image: string): Promise<PredictionResult> {
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
          content: `You are a product analysis AI specializing in identifying objects from images and providing accurate price estimates, manufacturing costs, and likely import origins. 
          
          Analyze the image with extremely high accuracy and provide:
          1. The specific name of the object with brand name if visible
          2. A realistic retail price in USD based on current market values
          3. An estimated manufacturing cost in USD
          4. The most likely country or region of manufacture
          5. Your confidence level (0.0-1.0)
          
          Your output must be a valid JSON object with the keys: name, price, manufacturingCost, importLocation, and confidence.
          For prices, include the dollar sign and decimal places: "$XX.XX"
          Be as specific as possible about the object, including brand name if recognizable.
          Ensure your confidence level accurately reflects your certainty about the identification and pricing.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "What is this object? Provide ONLY a JSON response with these exact keys: name, price, manufacturingCost, importLocation, confidence"
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
      max_tokens: 800,
      temperature: 0.2 // Lower temperature for more consistent results
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  console.log("OpenAI API response:", data);
  
  // Parse the response to extract the JSON data
  let parsedResponse: Record<string, any> = {};
  try {
    const content = data.choices[0].message.content;
    console.log("Raw content:", content);
    
    // Try multiple parsing strategies
    if (content) {
      // Strategy 1: Look for JSON block
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || 
                        content.match(/\{[\s\S]*\}/);
                        
      if (jsonMatch) {
        const jsonContent = jsonMatch[0].replace(/```json|```/g, '').trim();
        parsedResponse = JSON.parse(jsonContent);
        console.log("Found JSON block:", parsedResponse);
      } else {
        // Strategy 2: Parse the entire content
        parsedResponse = JSON.parse(content);
        console.log("Parsed entire content:", parsedResponse);
      }
    }
    
    // Validate the parsed response has all required fields
    if (!parsedResponse.name || !parsedResponse.price) {
      throw new Error("Invalid response format");
    }
    
  } catch (err) {
    console.error("Error parsing OpenAI response:", err);
    throw err; // Let the fallback mechanism handle it
  }
  
  // Extract and format values from the parsed JSON
  const objectName = parsedResponse.name || "Unknown Object";
  
  // Handle different price formats
  let price = parsedResponse.price;
  if (typeof price === 'number') {
    price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  } else if (typeof price === 'string' && !price.includes('$')) {
    price = `$${price}`;
  }
  
  // Handle different manufacturing cost formats
  let manufacturingCost = parsedResponse.manufacturingCost;
  if (typeof manufacturingCost === 'number') {
    manufacturingCost = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(manufacturingCost);
  } else if (typeof manufacturingCost === 'string' && !manufacturingCost.includes('$')) {
    manufacturingCost = `$${manufacturingCost}`;
  }
  
  const importLocation = parsedResponse.importLocation || "Unknown";
  const confidence = parsedResponse.confidence || 0.8;

  return {
    objectName: objectName.charAt(0).toUpperCase() + objectName.slice(1),
    price,
    manufacturingCost,
    importLocation,
    confidence
  };
}
