import { GoogleGenAI, Type } from "@google/genai";
import { CulturalEvent } from "../lib/types";

// This file acts as the server-side API handler for Guru
// In a Next.js app, this logic would live in app/api/guru-insight.ts

const getSystemPrompt = () => `
You are 'Guru', a scholarly cultural intelligence assistant for the Thalam platform.
Your role is to analyze and interpret living traditions, rituals, and cultural systems.

Behavioral Guidelines:
1. Tone: Scholarly, respectful, empathetic, but objective. Avoid sensationalism (e.g., don't use words like "bizarre", "mystic", "shocking").
2. Content: Focus on structural anthropology—explain *why* a ritual exists, its social function, and its historical roots.
3. Uncertainty: If you don't know something, label it as inference or state that sources are unclear.
4. Output: Provide a structured paragraph narration. Do not use bullet points or chat bubbles. Write in a flowing, narrative style.
5. Respect: When discussing spiritual practices, maintain dignity.

Context: The user is looking at a map of Kerala, India cultural traditions.
`;

export async function streamGuruInsight(query: string, contextEvent?: CulturalEvent) {
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing");
    throw new Error("API configuration error");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let prompt = `User Query: "${query}"\n`;
  
  if (contextEvent) {
    prompt += `
    Context: The user has selected the event "${contextEvent.name}" located in ${contextEvent.location.region}.
    Description: ${contextEvent.description}
    Significance: ${contextEvent.significance}
    Tags: ${contextEvent.tags.join(", ")}
    `;
  }

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: [
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: getSystemPrompt(),
        temperature: 0.7,
      }
    });

    return response;
  } catch (error) {
    console.error("Guru API Error:", error);
    throw error;
  }
}

// New function for Active Discovery in DNA Explorer
export async function discoverTraditionConnections(topic: string) {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Analyze the cultural tradition or concept: "${topic}".
  1. Identify the core tradition itself (as the root node).
  2. Identify 5-7 related cultural traditions, rituals, or art forms from around the world (focus on structural or thematic similarities).
  3. For each, provide a brief description, a preservation score (0-100 estimate based on global status), and its relationship to "${topic}".
  
  The relationship type should be one of: 'influenced_by', 'derivative_of', 'shares_root_with', 'geographically_linked'.
  The relationship strength should be between 0.1 (weak) and 1.0 (strong).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rootNode: {
               type: Type.OBJECT,
               properties: {
                 id: { type: Type.STRING },
                 name: { type: Type.STRING },
                 type: { type: Type.STRING, enum: ['ritual', 'festival', 'artform', 'custom'] },
                 description: { type: Type.STRING },
                 preservation_score: { type: Type.NUMBER },
                 significance: { type: Type.STRING },
               }
            },
            relatedNodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['ritual', 'festival', 'artform', 'custom'] },
                  description: { type: Type.STRING },
                  preservation_score: { type: Type.NUMBER },
                  significance: { type: Type.STRING },
                  relationshipType: { type: Type.STRING, enum: ['influenced_by', 'derivative_of', 'shares_root_with', 'geographically_linked'] },
                  relationshipStrength: { type: Type.NUMBER },
                }
              }
            }
          },
          required: ["rootNode", "relatedNodes"]
        }
      }
    });
    
    if (!response.text) {
        throw new Error("No data returned from Discovery API");
    }

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Discovery API Error:", error);
    throw error;
  }
}

// New function to scan for hidden traditions in a region
export async function discoverMoreLocalTraditions(region: string, excludeNames: string[]) {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
  Find 10 unique, lesser-known, or specific cultural traditions, rituals, or festivals in ${region} (Kerala) that are NOT in this list: ${excludeNames.slice(0, 10).join(', ')}.
  
  Focus on:
  1. Specific local rituals.
  2. Lesser-known festivals.
  3. Dying or endangered art forms.

  For each, provide:
  - Accurate name
  - Specific location coordinates (Lat/Lng).
  - Type (ritual, festival, artform, custom)
  - Category
  - Rich description and significance.
  - Emotional resonance.
  - Preservation score.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              location: {
                type: Type.OBJECT,
                properties: {
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER },
                  region: { type: Type.STRING }
                }
              },
              type: { type: Type.STRING, enum: ['ritual', 'festival', 'artform', 'custom'] },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              significance: { type: Type.STRING },
              seasonal_markers: { type: Type.ARRAY, items: { type: Type.STRING } },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              emotional_resonance: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
              preservation_score: { type: Type.NUMBER },
            }
          }
        }
      }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Local Discovery API Error:", error);
    throw error;
  }
}

// New function to analyze uploaded PDFs or Text
export async function analyzeCulturalSourceMaterial(
  textContent: string | null, 
  fileData: { mimeType: string, data: string } | null
) {
  if (!process.env.API_KEY) throw new Error("API_KEY is missing");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
  You are a Cultural Archivist. Analyze the provided source material (text or document).
  
  Task:
  1. Determine if this content describes a VALID cultural tradition, ritual, festival, or heritage site.
  2. If it is NOT a cultural topic, ignore it (return null or error in your reasoning).
  3. If it IS valid, extract a single primary Cultural Event structure from it.
  
  Requirements:
  - Validate the location. If only a region is given, estimate specific Lat/Lng for that region in Kerala (or relevant area).
  - Assign a 'Preservation Score' (0-100) based on the tone of the text.
  - Extract 'Seasonal Markers' if mentioned.
  - Summarize 'Significance' for an anthropological context.
  `;

  const parts = [];
  if (fileData) {
    parts.push({ inlineData: { mimeType: fileData.mimeType, data: fileData.data } });
  }
  if (textContent) {
    parts.push({ text: textContent });
  }
  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: parts }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValidCulturalContent: { type: Type.BOOLEAN },
            validationReason: { type: Type.STRING },
            event: {
               type: Type.OBJECT,
               properties: {
                 name: { type: Type.STRING },
                 location: {
                   type: Type.OBJECT,
                   properties: {
                     lat: { type: Type.NUMBER },
                     lng: { type: Type.NUMBER },
                     region: { type: Type.STRING }
                   }
                 },
                 type: { type: Type.STRING, enum: ['ritual', 'festival', 'artform', 'custom', 'history', 'nature', 'place', 'person', 'community', 'object'] },
                 category: { type: Type.STRING },
                 description: { type: Type.STRING },
                 significance: { type: Type.STRING },
                 seasonal_markers: { type: Type.ARRAY, items: { type: Type.STRING } },
                 tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                 emotional_resonance: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
                 preservation_score: { type: Type.NUMBER },
               }
            }
          },
          required: ["isValidCulturalContent", "validationReason"]
        }
      }
    });

    const result = JSON.parse(response.text);
    
    if (!result.isValidCulturalContent || !result.event) {
      throw new Error(result.validationReason || "Content did not contain a valid cultural entity.");
    }

    return result.event;

  } catch (error) {
    console.error("Source Analysis Error:", error);
    throw error;
  }
}