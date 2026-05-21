import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const FULL_MOCK_CATEGORIES = [
  {
    wasteCategory: 'Plastic',
    hazardLevel: 'Low',
    confidenceScore: 0.92,
    recyclingSuggestion: 'Rinse and place in the plastic recycling bin.',
    disposalRecommendation: 'Recycle as PET plastic.',
    hazardWarning: null,
    detectedItems: ['plastic bottle'],
  },
  {
    wasteCategory: 'Metal',
    hazardLevel: 'Low',
    confidenceScore: 0.88,
    recyclingSuggestion: 'Rinse and place in the metal recycling bin.',
    disposalRecommendation: 'Recycle as metal.',
    hazardWarning: null,
    detectedItems: ['metal can'],
  },
  {
    wasteCategory: 'Glass',
    hazardLevel: 'Low',
    confidenceScore: 0.85,
    recyclingSuggestion: 'Rinse and put in glass recycling.',
    disposalRecommendation: 'Recycle as glass.',
    hazardWarning: null,
    detectedItems: ['glass bottle'],
  },
  {
    wasteCategory: 'Paper',
    hazardLevel: 'Low',
    confidenceScore: 0.87,
    recyclingSuggestion: 'Flatten and recycle the paper.',
    disposalRecommendation: 'Recycle as paper.',
    hazardWarning: null,
    detectedItems: ['paper sheet'],
  },
  {
    wasteCategory: 'Organic',
    hazardLevel: 'Low',
    confidenceScore: 0.86,
    recyclingSuggestion: 'Compost if possible.',
    disposalRecommendation: 'Dispose in organic waste bin.',
    hazardWarning: null,
    detectedItems: ['fruit peel'],
  },
  {
    wasteCategory: 'Rubber',
    hazardLevel: 'Low',
    confidenceScore: 0.84,
    recyclingSuggestion: 'Recycle rubber products where facilities exist.',
    disposalRecommendation: 'Dispose in rubber waste collection.',
    hazardWarning: null,
    detectedItems: ['rubber glove'],
  },
  {
    wasteCategory: 'E-Waste',
    hazardLevel: 'High',
    confidenceScore: 0.91,
    recyclingSuggestion: 'Take to an e‑waste recycling point.',
    disposalRecommendation: 'Do not discard in regular trash.',
    hazardWarning: 'Contains hazardous components.',
    detectedItems: ['mobile phone'],
  },
  {
    wasteCategory: 'Medical Waste',
    hazardLevel: 'Hazardous',
    confidenceScore: 0.93,
    recyclingSuggestion: 'Handle with protective gear.',
    disposalRecommendation: 'Dispose via medical waste services.',
    hazardWarning: 'Potential biohazard.',
    detectedItems: ['used syringe'],
  },
  {
    wasteCategory: 'Mixed Waste',
    hazardLevel: 'Medium',
    confidenceScore: 0.80,
    recyclingSuggestion: 'Separate recyclable parts if possible.',
    disposalRecommendation: 'Dispose in mixed waste bin.',
    hazardWarning: null,
    detectedItems: ['mixed trash'],
  }
];
const systemInstruction = `You are an expert waste classification AI for a smart city waste management system.
Analyze the provided image and return ONLY a valid JSON object with no markdown, no code fences, and no additional text.

The JSON must follow this exact schema:
{
  "wasteCategory": one of ["Plastic", "Metal", "Glass", "Paper", "Organic", "Rubber", "E-Waste", "Medical Waste", "Mixed Waste"],
  "hazardLevel": one of ["Low", "Medium", "High", "Hazardous"],
  "confidenceScore": number between 0 and 1 (e.g. 0.87),
  "recyclingSuggestion": string (1-2 sentences),
  "disposalRecommendation": string (1-2 sentences),
  "hazardWarning": string or null (include only if hazardLevel is High or Hazardous),
  "detectedItems": array of strings (specific items visible, e.g. ["PET bottle", "aluminium can"])`;

/*
Apply these hazard rules strictly:
- Batteries of any kind -> Hazardous
- Medical syringes, gloves, or bandages -> Hazardous
- Broken glass -> Medium
- Electronic devices (phones, tablets, laptops, PCBs, chargers, cables) -> High (E-Waste)
- Food waste, leaves, vegetables -> Low
- Mixed unidentified waste -> Medium
- Single-use plastic bottles -> Low
- Paint cans, aerosols -> High
*/

/*
Examples:
- A smartphone or tablet should be classified as "wasteCategory": "E-Waste", "hazardLevel": "High".
- A laptop or computer monitor should be "E-Waste", "High".
- A battery (AA, AAA, lithium) should be "Metal", "Hazardous".
- A glass water bottle should be "Glass", "Low".
- An aluminium can should be "Metal", "Low".
- A plastic bottle should be "Plastic", "Low".
*/


export const analyzeWasteImage = async (base64Image: string) => {
  // Ensure a valid Gemini API key is present.
  console.error('API KEY BEING USED IS: ' + import.meta.env.VITE_GEMINI_API_KEY);
if (!import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY === 'YOUR_GEMINI_KEY') {
    console.warn('Gemini API key missing or invalid – using mock response.');
    const selected = FULL_MOCK_CATEGORIES[Math.floor(Math.random() * FULL_MOCK_CATEGORIES.length)];
    console.log('Returning mock Gemini response (no API key):', selected);
    return selected;
  }

  try {
    // Use the system instruction defined at the top of the file.
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction,
    });

    // Strip possible data URL prefix.
    const base64Data = base64Image.split(',')[1] || base64Image;

    // Provide a short textual prompt together with the image so Gemini knows we want identification.
    const result = await model.generateContent([
      { text: 'Identify the object in this image and classify it according to the waste schema.' },
      {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg',
        },
      },
    ]);

    const text = result.response.text();
    const cleanedText = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    try {
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.warn('Failed to parse Gemini response, falling back to mock.', parseError);
      const selected = FULL_MOCK_CATEGORIES[Math.floor(Math.random() * FULL_MOCK_CATEGORIES.length)];
      console.log('Demo mock response selected (parse fallback):', selected);
      return selected;
    }
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    const isQuotaError = /429|quota/i.test(error.message || '');
    if (isQuotaError) {
      console.warn('Gemini quota exceeded – returning random mock response.');
      const selected = FULL_MOCK_CATEGORIES[Math.floor(Math.random() * FULL_MOCK_CATEGORIES.length)];
      console.log('Demo mock response selected (quota fallback):', selected);
      return selected;
    }
    const fallback = FULL_MOCK_CATEGORIES[Math.floor(Math.random() * FULL_MOCK_CATEGORIES.length)];
    console.log('Demo mock response selected (error fallback):', fallback);
    return fallback;
  }
};
