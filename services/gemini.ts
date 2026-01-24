import { GoogleGenAI } from "@google/genai";

// Initialize Gemini with the API key from environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

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
  - Tasting notes (up to 6 distinct flavor keywords like Blueberry, Jasmine, Honey)

  Output the result purely as a valid JSON object with these keys: 
  country, region, farm, variety, process, altitude, flavorNotes (array of strings).
  If you can't find specific info, leave the field empty string.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    if (!text) return null;

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
