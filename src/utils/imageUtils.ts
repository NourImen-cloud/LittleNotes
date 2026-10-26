/**
 * Utilities for reading, compressing, and handling image files and clipboard pastes.
 * Ensures images fit cleanly in localStorage and sync efficiently without storage quota issues.
 */

export async function compressAndProcessImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (readerEvent) => {
      const dataUrl = readerEvent.target?.result as string;
      if (!dataUrl) {
        return reject(new Error('Image reader returned empty result'));
      }

      // If SVG or small GIF, keep as is
      if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
        return resolve(dataUrl);
      }

      const img = new Image();
      img.onerror = () => resolve(dataUrl); // fallback to original data url
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // If dimensions are within bounds and file is small (< 200KB), return as is
        if (width <= maxWidth && height <= maxHeight && file.size < 200 * 1024) {
          return resolve(dataUrl);
        }

        // Calculate aspect-ratio preserved dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(dataUrl);
        }

        // Fill white background in case of transparent PNG converted to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG or WebP
        try {
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(dataUrl);
        }
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
}

export async function processImageFiles(files: FileList | File[]): Promise<string[]> {
  const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
  if (fileArray.length === 0) return [];

  const promises = fileArray.map((file) =>
    compressAndProcessImage(file).catch((err) => {
      console.warn('Failed to process image file:', file.name, err);
      return null;
    })
  );

  const results = await Promise.all(promises);
  return results.filter((url): url is string => Boolean(url));
}

/**
 * Extracts any image from clipboard event (e.g. pasted screenshot or copied image).
 */
export async function getImagesFromClipboard(event: ClipboardEvent | React.ClipboardEvent): Promise<string[]> {
  const items = event.clipboardData?.items;
  if (!items) return [];

  const imageFiles: File[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) {
        imageFiles.push(file);
      }
    }
  }

  if (imageFiles.length === 0) return [];
  return processImageFiles(imageFiles);
}
