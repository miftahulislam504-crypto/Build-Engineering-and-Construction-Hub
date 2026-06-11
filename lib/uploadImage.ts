// lib/uploadImage.ts
// Firebase Storage-এ upload করার আগে image compress করা হয়

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Image compress করে Firebase Storage-এ upload করো
 * Max width/height: 800px | Quality: 85%
 */
export async function uploadCompressedImage(
  file: File,
  path: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.onload = async () => {
      try {
        const MAX    = 800;
        let w        = img.width;
        let h        = img.height;

        // Resize যদি বড় হয়
        if (w > h && w > MAX) { h = Math.round((h * MAX) / w); w = MAX; }
        else if (h > MAX)     { w = Math.round((w * MAX) / h); h = MAX; }

        const canvas = document.createElement("canvas");
        canvas.width  = w;
        canvas.height = h;

        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);

        URL.revokeObjectURL(url); // memory cleanup

        canvas.toBlob(
          async (blob) => {
            if (!blob) { reject(new Error("Compression failed")); return; }
            try {
              const storageRef = ref(storage, path);
              await uploadBytes(storageRef, blob, { contentType: "image/jpeg" });
              const downloadURL = await getDownloadURL(storageRef);
              resolve(downloadURL);
            } catch (err) {
              reject(err);
            }
          },
          "image/jpeg",
          0.85 // 85% quality
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error("Image load failed"));
    img.src     = url;
  });
}

/**
 * Product image upload
 * Folder: products/
 */
export async function uploadProductImage(file: File): Promise<string> {
  const filename = `products/${Date.now()}-${file.name.replace(/\s/g, "-")}`;
  return uploadCompressedImage(file, filename);
}

/**
 * Service image upload
 * Folder: services/
 */
export async function uploadServiceImage(file: File): Promise<string> {
  const filename = `services/${Date.now()}-${file.name.replace(/\s/g, "-")}`;
  return uploadCompressedImage(file, filename);
}

/**
 * Banner upload — bigger size allowed (1400x500)
 * Folder: banners/
 */
export async function uploadBannerImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.onload = async () => {
      const W      = 1400;
      const H      = 500;
      const canvas = document.createElement("canvas");
      canvas.width  = W;
      canvas.height = H;

      const ctx = canvas.getContext("2d")!;
      // Cover fit
      const scale = Math.max(W / img.width, H / img.height);
      const sw    = img.width  * scale;
      const sh    = img.height * scale;
      const sx    = (W - sw) / 2;
      const sy    = (H - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        async (blob) => {
          if (!blob) { reject(new Error("Compression failed")); return; }
          try {
            const path = `banners/${Date.now()}-${file.name.replace(/\s/g, "-")}`;
            const r    = ref(storage, path);
            await uploadBytes(r, blob, { contentType: "image/jpeg" });
            resolve(await getDownloadURL(r));
          } catch (err) {
            reject(err);
          }
        },
        "image/jpeg",
        0.90
      );
    };

    img.onerror = () => reject(new Error("Image load failed"));
    img.src     = url;
  });
}

/**
 * Avatar upload
 * Folder: avatars/{userId}/
 */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const path = `avatars/${userId}/avatar.jpg`;
  return uploadCompressedImage(file, path);
}
