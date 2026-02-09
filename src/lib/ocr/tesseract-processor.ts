/**
 * Server-side OCR processing using Tesseract.js v7 with sharp image preprocessing.
 *
 * Image preprocessing pipeline:
 * 1. Convert to grayscale
 * 2. Upscale to ensure width >= 2000px
 * 3. Normalize/enhance contrast
 * 4. Sharpen
 * 5. Output as PNG buffer
 *
 * Then runs Tesseract OCR with English + Thai language support.
 */

import sharp from "sharp";
import Tesseract from "tesseract.js";

const MIN_WIDTH = 2000;

/**
 * Preprocesses an image buffer using sharp to improve OCR accuracy.
 */
async function preprocessImage(imageBuffer: Buffer): Promise<Buffer> {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  let pipeline = image.grayscale();

  // Upscale if the image is too narrow
  if (metadata.width && metadata.width < MIN_WIDTH) {
    const scale = Math.ceil(MIN_WIDTH / metadata.width);
    pipeline = pipeline.resize({
      width: metadata.width * scale,
      kernel: sharp.kernel.lanczos3,
    });
  }

  // Normalize contrast (stretches the histogram to full range)
  pipeline = pipeline.normalize();

  // Sharpen the image to make text edges crisper
  pipeline = pipeline.sharpen({
    sigma: 1.5,
    m1: 1.0,
    m2: 0.5,
  });

  // Output as PNG for lossless quality
  return pipeline.png().toBuffer();
}

/**
 * Processes an image buffer through the OCR pipeline:
 * 1. Preprocesses the image with sharp
 * 2. Runs Tesseract OCR with English + Thai
 * 3. Returns the recognized text
 */
export async function processWithTesseract(
  imageBuffer: Buffer
): Promise<string> {
  // Step 1: Preprocess the image
  const preprocessedBuffer = await preprocessImage(imageBuffer);

  // Step 2: Run Tesseract OCR (v7 static API)
  const {
    data: { text },
  } = await Tesseract.recognize(preprocessedBuffer, "eng+tha");

  return text;
}
