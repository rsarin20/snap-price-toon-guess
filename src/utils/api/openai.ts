
import { PredictionResult } from '../types/prediction';

export async function predictWithOpenAI(base64Image: string): Promise<PredictionResult> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OpenAI API key in environment configuration.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a product analysis AI specializing in identifying objects from images and providing accurate price estimates, manufacturing costs, and likely import origins. 
          
          Analyze the image with high accuracy and provide:
          1. The specific name of the object
          2. A realistic retail price in USD based on current market values
          3. An estimated manufacturing cost in USD
          4. The most likely country or region of manufacture
          5. Your confidence level (0.0-1.0)
          
          Your output must be a valid JSON object with the keys: name, price, manufacturingCost, importLocation, and confidence.
          For prices, include the dollar sign and decimal places: "$XX.XX"
          Be as specific as possible about the object, including brand name if recognizable.`
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
      max_tokens: 500,
      temperature: 0.3
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  console.group("OpenAI Debug");
  console.log("Full response:", data);
  let parsedResponse: Record<string, any> = {};

  try {
    const content = data.choices[0]?.message?.content;
    console.log("Raw content:", content);

    if (content) {
      const jsonMatch =
        content.match(/```json\s*([\s\S]*?)```/) ||
        content.match(/```([\s\S]*?)```/) ||
        content.match(/(\{[\s\S]*\})/);

      if (jsonMatch && jsonMatch[1]) {
        parsedResponse = JSON.parse(jsonMatch[1].trim());
      } else if (jsonMatch && jsonMatch[0]) {
        parsedResponse = JSON.parse(jsonMatch[0].trim());
      } else {
        parsedResponse = JSON.parse(content.trim());
      }
    }

    if (!parsedResponse.name || !parsedResponse.price) {
      throw new Error("Invalid response format");
    }
  } catch (err) {
    console.error("Error parsing OpenAI response:", err);
    throw err;
  }

  console.log("Parsed response:", parsedResponse);
  console.groupEnd();

  const objectName = parsedResponse.name || "Unknown Object";

  // Format price
  let price = parsedResponse.price;
  if (typeof price === 'number') {
    price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  } else if (typeof price === 'string' && !price.includes('$')) {
    price = `$${price}`;
  }

  // Format manufacturing cost
  let manufacturingCost = parsedResponse.manufacturingCost;
  if (typeof manufacturingCost === 'number') {
    manufacturingCost = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(manufacturingCost);
  } else if (typeof manufacturingCost === 'string' && !manufacturingCost.includes('$')) {
    manufacturingCost = `$${manufacturingCost}`;
  }

  const importLocation = parsedResponse.importLocation || "Unknown";
  const confidence = typeof parsedResponse.confidence === 'number' ? parsedResponse.confidence : 0.8;

  return {
    objectName: objectName.charAt(0).toUpperCase() + objectName.slice(1),
    price,
    manufacturingCost,
    importLocation,
    confidence
  };
}
