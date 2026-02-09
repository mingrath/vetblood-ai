/**
 * Pattern matching logic to extract blood test parameter values from OCR text.
 * Handles both English and Thai alternative names for common veterinary blood
 * test parameters, and extracts the first numeric value following each anchor.
 */

// Standard parameter codes we look for
const STANDARD_CODES = [
  "RBC",
  "WBC",
  "HGB",
  "HCT",
  "MCV",
  "MCH",
  "MCHC",
  "RDW",
  "PLT",
  "NEU",
  "BAND",
  "EOS",
  "LYM",
  "MONO",
  "RETIC",
  "ALT",
  "SGPT",
  "AST",
  "SGOT",
  "CREA",
  "BUN",
  "ALP",
  "TBIL",
  "DBIL",
] as const;

/**
 * Maps alternative names (English and Thai) to standard parameter codes.
 * Keys are lowercased for case-insensitive matching.
 */
const ALTERNATIVE_NAMES: Record<string, string> = {
  // RBC - Red Blood Cells
  rbc: "RBC",
  "red blood cell": "RBC",
  "red blood cells": "RBC",
  erythrocyte: "RBC",
  erythrocytes: "RBC",
  "\u0e40\u0e21\u0e47\u0e14\u0e40\u0e25\u0e37\u0e2d\u0e14\u0e41\u0e14\u0e07": "RBC", // เม็ดเลือดแดง

  // WBC - White Blood Cells
  wbc: "WBC",
  "white blood cell": "WBC",
  "white blood cells": "WBC",
  leukocyte: "WBC",
  leukocytes: "WBC",
  "\u0e40\u0e21\u0e47\u0e14\u0e40\u0e25\u0e37\u0e2d\u0e14\u0e02\u0e32\u0e27": "WBC", // เม็ดเลือดขาว

  // HGB - Hemoglobin
  hgb: "HGB",
  hb: "HGB",
  hemoglobin: "HGB",
  haemoglobin: "HGB",
  "\u0e2e\u0e35\u0e42\u0e21\u0e42\u0e01\u0e25\u0e1a\u0e34\u0e19": "HGB", // ฮีโมโกลบิน

  // HCT - Hematocrit
  hct: "HCT",
  hematocrit: "HCT",
  haematocrit: "HCT",
  pcv: "HCT",
  "packed cell volume": "HCT",
  "\u0e2e\u0e35\u0e21\u0e32\u0e42\u0e15\u0e04\u0e23\u0e34\u0e15": "HCT", // ฮีมาโตคริต

  // MCV - Mean Corpuscular Volume
  mcv: "MCV",
  "mean corpuscular volume": "MCV",

  // MCH - Mean Corpuscular Hemoglobin
  mch: "MCH",
  "mean corpuscular hemoglobin": "MCH",
  "mean corpuscular haemoglobin": "MCH",

  // MCHC - Mean Corpuscular Hemoglobin Concentration
  mchc: "MCHC",
  "mean corpuscular hemoglobin concentration": "MCHC",

  // RDW - Red Cell Distribution Width
  rdw: "RDW",
  "red cell distribution width": "RDW",
  "rdw-cv": "RDW",

  // PLT - Platelets
  plt: "PLT",
  platelet: "PLT",
  platelets: "PLT",
  thrombocyte: "PLT",
  thrombocytes: "PLT",
  "\u0e40\u0e01\u0e25\u0e47\u0e14\u0e40\u0e25\u0e37\u0e2d\u0e14": "PLT", // เกล็ดเลือด

  // NEU - Neutrophils
  neu: "NEU",
  neut: "NEU",
  neutrophil: "NEU",
  neutrophils: "NEU",
  "\u0e19\u0e34\u0e27\u0e42\u0e17\u0e23\u0e1f\u0e34\u0e25": "NEU", // นิวโทรฟิล

  // BAND - Band Neutrophils
  band: "BAND",
  "band neutrophil": "BAND",
  "band neutrophils": "BAND",
  bands: "BAND",

  // EOS - Eosinophils
  eos: "EOS",
  eosinophil: "EOS",
  eosinophils: "EOS",
  "\u0e2d\u0e35\u0e42\u0e2d\u0e0b\u0e34\u0e42\u0e19\u0e1f\u0e34\u0e25": "EOS", // อีโอซิโนฟิล

  // LYM - Lymphocytes
  lym: "LYM",
  lymph: "LYM",
  lymphocyte: "LYM",
  lymphocytes: "LYM",
  "\u0e25\u0e34\u0e21\u0e42\u0e1f\u0e44\u0e0b\u0e15\u0e4c": "LYM", // ลิมโฟไซต์

  // MONO - Monocytes
  mono: "MONO",
  monocyte: "MONO",
  monocytes: "MONO",
  "\u0e42\u0e21\u0e42\u0e19\u0e44\u0e0b\u0e15\u0e4c": "MONO", // โมโนไซต์

  // RETIC - Reticulocytes
  retic: "RETIC",
  reticulocyte: "RETIC",
  reticulocytes: "RETIC",
  "retic count": "RETIC",

  // ALT - Alanine Aminotransferase
  alt: "ALT",
  "alanine aminotransferase": "ALT",
  "alanine transaminase": "ALT",

  // SGPT (same as ALT)
  sgpt: "ALT",

  // AST - Aspartate Aminotransferase
  ast: "AST",
  "aspartate aminotransferase": "AST",
  "aspartate transaminase": "AST",

  // SGOT (same as AST)
  sgot: "AST",

  // CREA - Creatinine
  crea: "CREA",
  creatinine: "CREA",
  "\u0e04\u0e23\u0e35\u0e40\u0e2d\u0e17\u0e34\u0e19\u0e34\u0e19": "CREA", // ครีเอทินิน

  // BUN - Blood Urea Nitrogen
  bun: "BUN",
  "blood urea nitrogen": "BUN",
  urea: "BUN",
  "\u0e22\u0e39\u0e40\u0e23\u0e35\u0e22": "BUN", // ยูเรีย

  // ALP - Alkaline Phosphatase
  alp: "ALP",
  "alkaline phosphatase": "ALP",
  alkp: "ALP",
  "alk phos": "ALP",

  // TBIL - Total Bilirubin
  tbil: "TBIL",
  "total bilirubin": "TBIL",
  "t.bil": "TBIL",
  "t-bil": "TBIL",
  "\u0e1a\u0e34\u0e25\u0e34\u0e23\u0e39\u0e1a\u0e34\u0e19\u0e23\u0e27\u0e21": "TBIL", // บิลิรูบินรวม

  // DBIL - Direct Bilirubin
  dbil: "DBIL",
  "direct bilirubin": "DBIL",
  "d.bil": "DBIL",
  "d-bil": "DBIL",
  "conjugated bilirubin": "DBIL",
};

/**
 * Normalizes a text string to a standard parameter code.
 * Returns null if the text doesn't match any known parameter.
 */
export function normalizeParameterCode(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // Check if it's already a standard code (case-insensitive)
  const upper = trimmed.toUpperCase();
  if ((STANDARD_CODES as readonly string[]).includes(upper)) {
    // Map SGPT -> ALT and SGOT -> AST for consistency
    if (upper === "SGPT") return "ALT";
    if (upper === "SGOT") return "AST";
    return upper;
  }

  // Check alternative names
  const lower = trimmed.toLowerCase();
  if (lower in ALTERNATIVE_NAMES) {
    return ALTERNATIVE_NAMES[lower];
  }

  return null;
}

/**
 * Extracts a numeric value string from text near an anchor position.
 * Looks for the first number within approximately 50 characters after the anchor.
 * Handles formats like "7.28", "37.0", "125", "12,500".
 */
function extractNumberAfterAnchor(
  text: string,
  anchorEnd: number
): string | null {
  // Look within 50 characters after the anchor
  const searchRegion = text.substring(anchorEnd, anchorEnd + 50);

  // Match a number: optional sign, digits with optional commas, optional decimal part
  const numberMatch = searchRegion.match(
    /[:\s]*?(-?\d[\d,]*(?:\.\d+)?)/
  );

  if (!numberMatch) return null;

  // Remove commas from the number (e.g. "12,500" -> "12500")
  const rawValue = numberMatch[1].replace(/,/g, "");
  return rawValue;
}

/**
 * Extracts blood test parameter values from OCR text.
 *
 * Strategy:
 * 1. Scan through the text looking for known parameter codes and alternative names.
 * 2. For each found anchor, extract the first number that follows it.
 * 3. Return a Record mapping parameter code to the extracted string value.
 */
export function extractValuesFromText(text: string): Record<string, string> {
  const values: Record<string, string> = {};

  // Build regex patterns for all known anchors
  // We try standard codes first (exact word boundary match), then longer alternative names
  const anchorPatterns: Array<{ pattern: RegExp; code: string }> = [];

  // Standard codes - match as whole words (case-insensitive)
  for (const code of STANDARD_CODES) {
    anchorPatterns.push({
      pattern: new RegExp(`\\b${escapeRegex(code)}\\b`, "gi"),
      code: code === "SGPT" ? "ALT" : code === "SGOT" ? "AST" : code,
    });
  }

  // Alternative names - sorted by length descending to prefer longer matches
  const sortedAlternatives = Object.entries(ALTERNATIVE_NAMES).sort(
    ([a], [b]) => b.length - a.length
  );

  for (const [name, code] of sortedAlternatives) {
    // Skip if it's the same as a standard code (already covered above)
    if ((STANDARD_CODES as readonly string[]).includes(name.toUpperCase())) {
      continue;
    }

    anchorPatterns.push({
      pattern: new RegExp(escapeRegex(name), "gi"),
      code,
    });
  }

  // For each anchor pattern, try to find it in the text and extract the value
  for (const { pattern, code } of anchorPatterns) {
    // If we already have a value for this code, skip
    if (values[code] !== undefined) continue;

    let match: RegExpExecArray | null;
    // Reset lastIndex for global regex
    pattern.lastIndex = 0;

    while ((match = pattern.exec(text)) !== null) {
      const anchorEnd = match.index + match[0].length;
      const extracted = extractNumberAfterAnchor(text, anchorEnd);

      if (extracted !== null) {
        values[code] = extracted;
        break;
      }
    }
  }

  return values;
}

/**
 * Escapes special regex characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
