/**
 * Server-side OCR processing using Google Gemini Vision API.
 * Sends the blood test image to Gemini and asks it to extract structured
 * parameter values as JSON.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const EXTRACTION_PROMPT = `You are analyzing a veterinary blood test report image. The report may contain text in English, Thai, or both.

Extract all blood test parameter values you can find from this image. Return ONLY a JSON object mapping parameter codes to their numeric values as strings.

Use these standard parameter codes:
- Hematology: RBC, WBC, HGB, HCT, MCV, MCH, MCHC, RDW, PLT, NEU, BAND, EOS, LYM, MONO, RETIC
- Chemistry: ALT (also known as SGPT), AST (also known as SGOT), CREA, BUN, ALP, TBIL, DBIL

Important rules:
- Map SGPT values to "ALT" and SGOT values to "AST"
- Use the standard codes listed above as keys
- Values should be numeric strings (e.g., "7.28", "12.5", "125")
- Remove commas from numbers (e.g., "12,500" becomes "12500")
- Only include parameters you can clearly read from the image
- Do NOT include units, only the numeric values
- If a value is qualitative (like "Negative" or "Positive"), include it as-is

Return ONLY the JSON object, no other text. Example:
{"RBC": "7.28", "WBC": "12.5", "HGB": "15.2", "HCT": "45.0", "ALT": "42", "CREA": "1.2"}`;

/**
 * Processes a blood test image using Gemini Vision to extract parameter values.
 *
 * @param imageBuffer - The raw image buffer
 * @param mimeType - The MIME type of the image (e.g., "image/jpeg", "image/png")
 * @param apiKey - The Google AI (Gemini) API key
 * @returns A Record mapping parameter codes to extracted value strings
 */
export async function processWithGemini(
  imageBuffer: Buffer,
  mimeType: string,
  apiKey: string
): Promise<Record<string, string>> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Convert buffer to base64 for the API
  const base64Image = imageBuffer.toString("base64");

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: base64Image,
      },
    },
    { text: EXTRACTION_PROMPT },
  ]);

  const response = result.response;
  const responseText = response.text().trim();

  // Parse the JSON from the response
  // Gemini might wrap JSON in markdown code blocks, so handle that
  let jsonStr = responseText;

  // Strip markdown code block if present
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);

    // Validate and clean the result: ensure all values are strings
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (value !== null && value !== undefined) {
        result[key] = String(value);
      }
    }

    return result;
  } catch {
    throw new Error(
      `Failed to parse Gemini response as JSON: ${responseText.substring(0, 200)}`
    );
  }
}
