
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { AspectRatio, ImageSize } from "../types";

const handleApiError = (error: any): string => {
  console.error("Forensic API Error:", error);
  const message = error?.message || "";
  
  if (message.includes("SAFETY")) {
    return "HEURISTIC BLOCK: THE REQUESTED CONTENT TRIGGERED SAFETY FILTERS AND CANNOT BE PROCESSED.";
  }
  if (message.includes("429") || message.includes("quota")) {
    return "THROTTLING DETECTED: SYSTEM QUOTA EXHAUSTED. PLEASE TRY AGAIN LATER.";
  }
  if (message.includes("403") || message.includes("API key") || message.includes("not found")) {
    return "ACCESS DENIED: INVALID OR MISSING CREDENTIALS. RE-LINK PERSONAL API KEY.";
  }
  if (message.includes("Network") || message.includes("fetch")) {
    return "UPLINK FAILURE: UNABLE TO ESTABLISH CONNECTION WITH THE CLOUD LABS.";
  }
  
  return `SYSTEM ANOMALY: ${message || "UNKNOWN ERROR IN PROCESSING PIPELINE"}`;
};

export const generateImage = async (prompt: string, aspectRatio: AspectRatio, imageSize: ImageSize): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: `A stark monochromatic black and white artistic image of: ${prompt}. Minimalist style, high contrast, clean lines.` }],
      },
      config: {
        imageConfig: {
          aspectRatio,
          imageSize
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image part found in model response.");
  } catch (err) {
    throw new Error(handleApiError(err));
  }
};

export const editImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1],
              mimeType,
            },
          },
          {
            text: `Modify this image to be strictly monochromatic black and white. Additionally: ${prompt}`,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Transformation engine failed to return image data.");
  } catch (err) {
    throw new Error(handleApiError(err));
  }
};

export const analyzeImage = async (base64Image: string, mimeType: string): Promise<{text: string, citations: any[]}> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1],
              mimeType,
            },
          },
          {
            text: `Perform a deep forensic scan. YOU MUST ORGANIZE YOUR RESPONSE INTO THESE EXACT SECTIONS:
            
[SUBJECT_SUMMARY]: Describe the main subject, identity, and visual components.
[TECHNICAL_VECTORS]: Identify image source (camera, software, vector origin), artifacts, and hardware indicators.
[GEOGRAPHIC_OVERVIEW]: Location data if visible or inferred.
[INTELLIGENCE_DATA]: Search findings, historical context, or brand evolution details.

Use bullet points for lists. Be professional, cold, and informative.`,
          },
        ],
      },
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const citations = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return {
      text: response.text || "No linguistic analysis generated.",
      citations
    };
  } catch (err) {
    throw new Error(handleApiError(err));
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Speak this forensic report in a professional, cold tone: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioBase64) throw new Error("Audio synthesis engine returned empty stream.");
    return audioBase64;
  } catch (err) {
    throw new Error(handleApiError(err));
  }
};
