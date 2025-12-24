import {
  GoogleGenAI,
  Type,
  GenerateContentResponse,
  Modality,
} from "@google/genai";
import { AspectRatio, ImageSize } from "../types";

/**
 * Unified key resolver.
 * Priority:
 * 1. Process Environment Variable (Root .env)
 * 2. Local Forensic Vault (Manual UI Injection)
 */
export const resolveApiKey = (): string => {
  try {
    // Check for environment variables first (Project Requirement)
    if (
      typeof process !== "undefined" &&
      process.env &&
      process.env.API_KEY &&
      process.env.API_KEY !== "undefined" &&
      process.env.API_KEY !== ""
    ) {
      return process.env.API_KEY;
    }

    // Check for build-time meta env (Vite/Build tool support)
    // @ts-ignore
    if (
      typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.VITE_API_KEY
    ) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }

    // Fallback: Local Forensic Vault
    const vaultKey = localStorage.getItem("FORENSIC_PROTOCOL_KEY");
    if (vaultKey && vaultKey.trim().length > 10) return vaultKey.trim();
  } catch (e) {
    console.warn("Credential vault inaccessible.");
  }
  return "";
};

const getAiInstance = () => {
  const apiKey = resolveApiKey();
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

const handleApiError = (error: any): string => {
  console.error("Forensic API Error:", error);
  const message = error?.message || String(error);

  if (message === "API_KEY_MISSING") {
    return "CREDENTIAL ERROR: NO PROTOCOL KEY DETECTED. PLEASE LINK A KEY IN THE GATEWAY.";
  }
  if (message.includes("SAFETY")) {
    return "HEURISTIC BLOCK: CONTENT TRIGGERED SYSTEM SAFETY FILTERS.";
  }
  if (message.includes("429") || message.includes("quota")) {
    return "THROTTLING: QUOTA EXHAUSTED OR RATE LIMIT REACHED.";
  }
  if (message.includes("403") || message.includes("not found")) {
    // Reset local key if it's invalid
    localStorage.removeItem("FORENSIC_PROTOCOL_KEY");
    return "ACCESS DENIED: THE PROVIDED KEY IS INVALID. NODE RESET INITIATED.";
  }

  return `SYSTEM ANOMALY: ${message || "UNKNOWN PIPELINE FAILURE"}`;
};

export const generateImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  imageSize: ImageSize
): Promise<string> => {
  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: {
        parts: [
          {
            text: `A stark monochromatic black and white artistic image of: ${prompt}. Minimalist style, high contrast, clean lines.`,
          },
        ],
      },
      config: {
        imageConfig: { aspectRatio, imageSize },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData)
        return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No image part found.");
  } catch (err) {
    throw new Error(handleApiError(err));
  }
};

export const editImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(",")[1], mimeType } },
          {
            text: `Modify this image to be strictly monochromatic black and white. Additionally: ${prompt}`,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData)
        return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("Transformation failed.");
  } catch (err) {
    throw new Error(handleApiError(err));
  }
};

export const analyzeImage = async (
  base64Image: string,
  mimeType: string
): Promise<{ text: string; citations: any[] }> => {
  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(",")[1], mimeType } },
          {
            text: `Perform a deep forensic scan. Organize into [SUBJECT_SUMMARY], [TECHNICAL_VECTORS], [GEOGRAPHIC_OVERVIEW], [INTELLIGENCE_DATA].`,
          },
        ],
      },
      config: { tools: [{ googleSearch: {} }] },
    });

    return {
      text: response.text || "No analysis generated.",
      citations:
        response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
    };
  } catch (err) {
    throw new Error(handleApiError(err));
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
        },
      },
    });
    return (
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || ""
    );
  } catch (err) {
    throw new Error(handleApiError(err));
  }
};
