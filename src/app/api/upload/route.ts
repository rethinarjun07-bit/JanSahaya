import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Maximum 10MB file limit as documented
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "audio/webm",
  "audio/wav",
  "audio/mpeg",
  "audio/mp3",
  "audio/ogg",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".webm",
  ".wav",
  ".mp3",
  ".ogg",
]);

function validateMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return true;

  // GIF: 47 49 46
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return true;

  // RIFF (WEBP or WAV)
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
    if (buffer.length >= 12) {
      const format = buffer.toString("ascii", 8, 12);
      if (format === "WEBP" || format === "WAVE") return true;
    }
    return true;
  }

  // OGG: 4F 67 67 53
  if (buffer[0] === 0x4f && buffer[1] === 0x67 && buffer[2] === 0x67 && buffer[3] === 0x53) return true;

  // MP3: ID3 header (49 44 33) or MPEG sync frame (FF FB / FF F3 / FF F2)
  if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) return true;
  if (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) return true;

  // WebM / Matroska: 1A 45 DF A3
  if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) return true;

  return false;
}

export async function POST(request: Request) {
  try {
    const session = await getUserFromRequest(request);
    // In production, enforce authentication. In demo mode, allow intake for field testing.
    const isDemo = process.env.DEMO_MODE === "true" || process.env.NEXT_PUBLIC_DEMO_MODE === "true";
    if (!session && !isDemo) {
      return NextResponse.json(
        { error: "Authentication required to upload media", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 1. Validate File Size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds the 10MB limit (size: ${(file.size / (1024 * 1024)).toFixed(1)}MB)` },
        { status: 400 }
      );
    }

    // 2. Validate MIME Type
    if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Allowed types: JPEG, PNG, WEBP, GIF, WEBM, WAV, MP3, OGG.` },
        { status: 400 }
      );
    }

    // 3. Validate Extension
    const rawExt = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(rawExt)) {
      return NextResponse.json(
        { error: `Invalid file extension '${rawExt}'. Only safe media extensions are allowed.` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Validate Magic Bytes / File Signature
    if (!validateMagicBytes(buffer)) {
      return NextResponse.json(
        { error: "File content signature does not match valid image or audio format." },
        { status: 400 }
      );
    }

    // 5. Secure Storage Path & Filename Generation (prevents directory traversal and overwrite)
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const randomSuffix = crypto.randomBytes(8).toString("hex");
    const sanitizedBase = path.basename(file.name, rawExt).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
    const safeFilename = `${Date.now()}-${sanitizedBase}-${randomSuffix}${rawExt}`;
    const filePath = path.join(uploadDir, safeFilename);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${safeFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: safeFilename,
      sizeBytes: file.size,
      mimeType: file.type,
    });
  } catch (error: unknown) {
    console.error("Secure Upload API Error:", error);
    return NextResponse.json({ error: "Failed to securely process upload" }, { status: 500 });
  }
}
