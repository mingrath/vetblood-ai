import { NextRequest, NextResponse } from "next/server";
import { processWithTesseract } from "@/lib/ocr/tesseract-processor";
import { extractValuesFromText } from "@/lib/ocr/pattern-matcher";
import { processWithGemini } from "@/lib/ocr/gemini-processor";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const method = formData.get("method") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!method || !["tesseract", "gemini"].includes(method)) {
      return NextResponse.json(
        { error: 'Invalid method. Use "tesseract" or "gemini".' },
        { status: 400 }
      );
    }

    // Read the file into a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (method === "tesseract") {
      // Tesseract OCR pipeline
      const text = await processWithTesseract(buffer);
      const values = extractValuesFromText(text);

      return NextResponse.json({
        text,
        values,
        method: "tesseract",
      });
    }

    // Gemini Vision pipeline
    const settings = await prisma.appSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings?.geminiApiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured. Go to Settings to add it." },
        { status: 400 }
      );
    }

    const mimeType = file.type || "image/png";
    const values = await processWithGemini(
      buffer,
      mimeType,
      settings.geminiApiKey
    );

    return NextResponse.json({
      values,
      method: "gemini",
    });
  } catch (error) {
    console.error("OCR processing error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: `OCR processing failed: ${message}` },
      { status: 500 }
    );
  }
}
