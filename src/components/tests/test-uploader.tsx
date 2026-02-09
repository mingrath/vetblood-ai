"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, Image as ImageIcon, Loader2, X, Zap, Cpu } from "lucide-react";

interface TestUploaderProps {
  onOcrComplete: (values: Record<string, string>, rawText?: string) => void;
  hasApiKey: boolean;
}

type OcrMethod = "tesseract" | "gemini";

export function TestUploader({ onOcrComplete, hasApiKey }: TestUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [method, setMethod] = useState<OcrMethod>("tesseract");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setError(null);

    // Generate preview for image files
    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFile(droppedFile);
      }
    },
    [handleFile]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFile(selectedFile);
      }
    },
    [handleFile]
  );

  const clearFile = useCallback(() => {
    setFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [preview]);

  const processOcr = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("method", method);

      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "OCR processing failed");
      }

      onOcrComplete(data.values, data.text);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="size-5" />
          Upload Blood Test Image
        </CardTitle>
        <CardDescription>
          Upload a photo or scan of a blood test report for automatic value
          extraction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop zone */}
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed
              p-8 cursor-pointer transition-colors
              ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
              }
            `}
          >
            <div className="rounded-full bg-muted p-3">
              <ImageIcon className="size-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                Drop your blood test image here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse (JPG, PNG, PDF)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-3">
            {/* File preview */}
            <div className="relative rounded-lg border bg-muted/30 p-3">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={clearFile}
                disabled={isProcessing}
              >
                <X className="size-3.5" />
              </Button>

              <div className="flex items-start gap-3">
                {preview ? (
                  <img
                    src={preview}
                    alt="Blood test preview"
                    className="h-32 w-auto rounded border object-contain"
                  />
                ) : (
                  <div className="flex h-32 w-24 items-center justify-center rounded border bg-muted">
                    <ImageIcon className="size-8 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1 pt-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            </div>

            {/* OCR Method toggle */}
            <div className="space-y-2">
              <p className="text-sm font-medium">OCR Method</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={method === "tesseract" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMethod("tesseract")}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <Cpu className="size-3.5" />
                  Free (Tesseract)
                </Button>
                <Button
                  type="button"
                  variant={method === "gemini" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (hasApiKey) setMethod("gemini");
                  }}
                  disabled={isProcessing || !hasApiKey}
                  className="flex-1"
                  title={
                    !hasApiKey
                      ? "Add a Gemini API key in Settings to enable"
                      : undefined
                  }
                >
                  <Zap className="size-3.5" />
                  Premium (Gemini)
                </Button>
              </div>
              {!hasApiKey && (
                <p className="text-xs text-muted-foreground">
                  Add a Gemini API key in Settings to unlock Gemini-powered
                  OCR
                </p>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Process button */}
            <Button
              onClick={processOcr}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {method === "tesseract"
                    ? "Processing with Tesseract..."
                    : "Processing with Gemini..."}
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  Extract Values
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
