"use client";

import { useEffect, useState } from "react";

/**
 * Logos are usually exported on a solid-color canvas rather than a
 * transparent one. Sample a small block in each corner, treat the average
 * as the background, and erase pixels close to it (with a feathered edge
 * for anti-aliasing) so the mark reads correctly against any backdrop.
 * SVGs are rasterized too, since they commonly bake in a background rect
 * that vector output alone wouldn't strip.
 */
export function stripSolidBackgroundFromFile(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const isSvg = file.type === "image/svg+xml";
      const canvas = rasterizeAndStrip(img, isSvg);
      if (!canvas) {
        resolve(file);
        return;
      }
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(file);
          return;
        }
        resolve(new File([blob], file.name.replace(/\.\w+$/, ".png"), { type: "image/png" }));
      }, "image/png");
    };
    img.onerror = () => resolve(file);
    img.src = objectUrl;
  });
}

/** Same processing, but reading a remote URL (e.g. a stored logo) and
 * returning an object URL for the transparent result. Used to render an
 * already-uploaded logo without a background, without touching the
 * original stored file (other places keep showing it as uploaded). */
export function stripSolidBackgroundFromUrl(url: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const isSvg = url.toLowerCase().endsWith(".svg");
        const canvas = rasterizeAndStrip(img, isSvg);
        if (!canvas) {
          resolve(url);
          return;
        }
        canvas.toBlob((blob) => {
          if (!blob) {
            resolve(url);
            return;
          }
          resolve(URL.createObjectURL(blob));
        }, "image/png");
      } catch {
        // Canvas reads can throw (tainted canvas if the host doesn't send
        // permissive CORS headers) — fall back to the original image.
        resolve(url);
      }
    };
    img.onerror = () => resolve(url);
    img.src = url;
  });
}

/** Renders `url` with its background stripped, falling back to the
 * original URL until processing finishes (or if it fails/CORS-blocks). */
export function useTransparentLogo(url: string | null): string | null {
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setProcessedUrl(null);
      return;
    }
    let cancelled = false;
    let objectUrl: string | null = null;
    stripSolidBackgroundFromUrl(url).then((result) => {
      if (cancelled) return;
      if (result.startsWith("blob:")) objectUrl = result;
      setProcessedUrl(result);
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  return processedUrl ?? url;
}

function rasterizeAndStrip(img: HTMLImageElement, isSvg: boolean): HTMLCanvasElement | null {
  const scale = isSvg ? Math.max(1, Math.min(4, 800 / Math.max(img.naturalWidth || 300, 1))) : 1;
  const width = Math.round((img.naturalWidth || 300) * scale);
  const height = Math.round((img.naturalHeight || 150) * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, width, height);

  const data = ctx.getImageData(0, 0, width, height);
  const px = data.data;
  const size = Math.max(1, Math.min(6, Math.floor(Math.min(width, height) / 10)));
  const sampleBlock = (x0: number, y0: number) => {
    let r = 0, g = 0, b = 0, n = 0;
    for (let y = y0; y < y0 + size; y++) {
      for (let x = x0; x < x0 + size; x++) {
        const i = (y * width + x) * 4;
        r += px[i]; g += px[i + 1]; b += px[i + 2]; n++;
      }
    }
    return [r / n, g / n, b / n];
  };
  const samples = [
    sampleBlock(0, 0),
    sampleBlock(width - size, 0),
    sampleBlock(0, height - size),
    sampleBlock(width - size, height - size),
  ];
  const bg = samples.reduce((acc, s) => [acc[0] + s[0] / 4, acc[1] + s[1] / 4, acc[2] + s[2] / 4], [0, 0, 0]);

  const threshold = 40;
  const feather = 30;
  for (let i = 0; i < px.length; i += 4) {
    const dist = Math.sqrt((px[i] - bg[0]) ** 2 + (px[i + 1] - bg[1]) ** 2 + (px[i + 2] - bg[2]) ** 2);
    if (dist < threshold) {
      px[i + 3] = 0;
    } else if (dist < threshold + feather) {
      px[i + 3] = Math.round((px[i + 3] * (dist - threshold)) / feather);
    }
  }
  ctx.putImageData(data, 0, 0);
  return canvas;
}
