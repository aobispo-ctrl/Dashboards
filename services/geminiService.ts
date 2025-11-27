import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedDashboard } from "../types";
import { GEMINI_FLASH_MODEL } from "../constants";

// Initialize the API client
// Note: process.env.API_KEY is expected to be available in the build environment
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Generates a structured dashboard based on a topic OR raw file data using JSON Schema mode.
 */
export const generateDashboardData = async (input: string, isFileData: boolean = false): Promise<GeneratedDashboard> => {
  if (!apiKey) throw new Error("API Key not found in environment variables.");

  let promptText = "";

  if (isFileData) {
    // Limit input size for safety, though Flash has a large context window (1M tokens).
    // 200,000 chars is roughly 50k tokens, which is very safe and allows for decent sized CSVs.
    const safeInput = input.length > 200000 ? input.slice(0, 200000) + "\n...(truncated)" : input;

    promptText = `Analyze the following dataset and generate a comprehensive analytical dashboard structure.
    
    Dataset content:
    """
    ${safeInput}
    """
    
    Based on this data:
    1. Summarize the key insights.
    2. Extract 3 high-level metrics (aggregations, totals, or averages).
    3. Create 2 charts that best visualize the trends or distributions in the data (Bar, Line, or Area).
    
    Ensure the data arrays for the charts are populated with values derived from the dataset provided.`;
  } else {
    promptText = `Create a comprehensive analytical dashboard for the topic: "${input}". 
    Generate realistic mock data. Include 3 key metrics and 2 charts (one bar, one line or area).`;
  }

  const response = await ai.models.generateContent({
    model: GEMINI_FLASH_MODEL,
    contents: promptText,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Dashboard title" },
          summary: { type: Type.STRING, description: "Brief executive summary of the data" },
          metrics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                value: { type: Type.STRING },
                trend: { type: Type.STRING, enum: ["up", "down", "neutral"] },
                percentage: { type: Type.STRING }
              },
              required: ["label", "value", "trend"]
            }
          },
          charts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["bar", "line", "area"] },
                xAxisKey: { type: Type.STRING, description: "Key for X axis data (usually name/date)" },
                dataKey: { type: Type.STRING, description: "Key for Y axis data (value)" },
                data: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      value: { type: Type.NUMBER },
                      secondaryValue: { type: Type.NUMBER }
                    },
                    required: ["name", "value"]
                  }
                }
              },
              required: ["title", "type", "data", "xAxisKey", "dataKey"]
            }
          }
        },
        required: ["title", "summary", "metrics", "charts"]
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as GeneratedDashboard;
  }
  throw new Error("No data returned from Gemini");
};

/**
 * Runs a multi-step automation task (simulated via Chain of Thought prompting).
 */
export const runAutomationTask = async (input: string, taskType: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key not found.");

  const response = await ai.models.generateContent({
    model: GEMINI_FLASH_MODEL,
    contents: `Input Data: "${input}"`,
    config: {
      systemInstruction: `You are an intelligent automation agent. 
      Your task is: ${taskType}. 
      Perform the task step-by-step and provide a clear, formatted output. 
      Use Markdown for formatting.`,
      temperature: 0.7,
    }
  });

  return response.text || "No response generated.";
};

/**
 * Simple Chat Interface
 */
export const sendChatMessage = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
    if (!apiKey) throw new Error("API Key not found.");
    
    const contents = [
        ...history,
        { role: 'user', parts: [{ text: message }] }
    ];

    const response = await ai.models.generateContent({
        model: GEMINI_FLASH_MODEL,
        contents: contents as any 
    });

    return response.text || "";
}