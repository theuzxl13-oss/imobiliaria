"use client";

import { createClient } from "@/lib/supabase/client";
import { STORAGE_BUCKET } from "@/lib/env";

const MAX_SIDE = 1920;
const MAX_FILE_MB = 15;
export const ACCEPTED_IMAGES = "image/jpeg,image/png,image/webp,image/avif";

/** Reduz a foto para no máximo 1920px e converte para WebP (economiza espaço e acelera o site). */
async function compress(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

function extensionFor(type: string) {
  return { "image/webp": "webp", "image/png": "png", "image/avif": "avif" }[type] ?? "jpg";
}

export function validateImageFiles(files: File[]) {
  const valid: File[] = [];
  const errors: string[] = [];
  for (const file of files) {
    if (!ACCEPTED_IMAGES.split(",").includes(file.type)) errors.push(`${file.name}: formato não suportado.`);
    else if (file.size > MAX_FILE_MB * 1024 * 1024) errors.push(`${file.name}: maior que ${MAX_FILE_MB} MB.`);
    else valid.push(file);
  }
  return { valid, errors };
}

/** Envia arquivos para o Supabase Storage e devolve os caminhos salvos. */
export async function uploadImages(
  folder: string,
  files: File[],
  onProgress?: (done: number, total: number) => void,
) {
  const supabase = createClient();
  const paths: string[] = [];
  const failed: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const blob = await compress(files[i]);
    const type = blob.type || files[i].type;
    const path = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extensionFor(type)}`;
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, blob, { contentType: type, cacheControl: "31536000", upsert: false });
    if (error) {
      console.error("upload:", error.message);
      failed.push(files[i].name);
    } else {
      paths.push(path);
    }
    onProgress?.(i + 1, files.length);
  }
  return { paths, failed };
}

export function publicUrl(path: string) {
  return createClient().storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}
