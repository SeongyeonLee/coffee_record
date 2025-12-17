import { GoogleGenAI } from "@google/genai";

// Initialize Gemini with the API key from environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getCoffeeDetails = async (roaster: string, beanName: string) => {
  if (!roaster && !beanName) return null;

  const query = `Find technical details for the coffee bean "${beanName}" from roaster "${roaster}". 
  I need the following specific details: 
  - Country of origin
  - Region
  - Farm or Station
  - Variety (e.g. Gesha, Caturra)
  - Processing method (Natural, Washed, etc)
  - Altitude (in masl, just the number)
  - Tasting notes (3 distinct adjectives)

  Output the result purely as a valid JSON object with these keys: 
  country, region, farm, variety, process, altitude, flavorNotes (array of strings).
  If you can't find specific info, leave the field empty string.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        // We cannot use responseMimeType: 'application/json' with tools, 
        // so we rely on the prompt to enforce JSON format.
      },
    });

    const text = response.text;
    if (!text) return null;

    // Extract JSON from the response (in case of markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to fetch coffee details.");
  }
};
