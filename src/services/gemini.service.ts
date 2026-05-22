// src/services/gemini.service.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

// ---------------------------------------------------------------------------
// 1️⃣  Create the genAI instance **only if** a real key exists.
//     Otherwise we stay in “mock‑only” mode and never hit the external API.
// ---------------------------------------------------------------------------
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const genAI = GEMINI_KEY && GEMINI_KEY !== 'YOUR_GEMINI_KEY'
  ? new GoogleGenerativeAI(GEMINI_KEY)
  : null;

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

// ---------------------------------------------------------------------------
// System prompt for Gemini (unchanged from original implementation)
// ---------------------------------------------------------------------------
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
  "detectedItems": array of strings (specific items visible, e.g. ["PET bottle", "aluminium can"]).`;

// ---------------------------------------------------------------------------
// Helper: can we actually call Gemini?
// ---------------------------------------------------------------------------
function canUseGemini(): boolean {
  return !!genAI;
}

/**
 * Analyze an image with Gemini. If the API key is missing or a request fails,
 * a random mock response from `FULL_MOCK_CATEGORIES` is returned instead.
 */
export const analyzeWasteImage = async (base64Image: string) => {
  console.info('Gemini key in use:', GEMINI_KEY ? '✅ present' : '❌ missing – using mock data');

  // --------------------------------------------------------------
  // No real key → always mock.
  // --------------------------------------------------------------
  if (!canUseGemini()) {
    const mock = FULL_MOCK_CATEGORIES[Math.floor(Math.random() * FULL_MOCK_CATEGORIES.length)];
    console.warn('Gemini not available – returning mock response', mock);
    return mock;
  }

  // --------------------------------------------------------------
  // Real Gemini call – fully guarded.
  // --------------------------------------------------------------
  try {
    const model = genAI!.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction,
    });

    const base64Data = base64Image.split(',')[1] ?? base64Image;

    const result = await model.generateContent([
      { text: 'Identify the object in this image and classify it according to the waste schema.' },
      { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
    ]);

    const text = result.response.text();
    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(clean);
  } catch (err: any) {
    console.error('Gemini API call failed:', err);
    throw new Error(err.message || 'Failed to analyze image with Gemini AI');
  }
};
