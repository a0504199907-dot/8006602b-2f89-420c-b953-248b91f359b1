/**
 * Watermark utility - adds logo watermark to uploaded images
 */

import logoUrl from '@/assets/uploads/logo.png';

interface WatermarkOptions {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  opacity?: number; // 0-1
  scale?: number; // Logo size as percentage of image width (0-1)
  margin?: number; // Pixels from edge
}

const DEFAULT_OPTIONS: WatermarkOptions = {
  position: 'center',
  opacity: 0.25, // More transparent - doesn't interfere with viewing
  scale: 0.25, // 25% of image width - larger in center for protection
  margin: 15
};

// Cache the logo image
let cachedLogo: HTMLImageElement | null = null;

function loadLogo(): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (cachedLogo) {
      resolve(cachedLogo);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      cachedLogo = img;
      resolve(img);
    };
    img.onerror = () => reject(new Error('Failed to load logo'));
    img.src = logoUrl;
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

/**
 * Add watermark to an image
 * @param imageSrc - Base64 or URL of the source image
 * @param options - Watermark options
 * @returns Promise<string> - Base64 of watermarked image
 */
export async function addWatermark(
  imageSrc: string,
  options: WatermarkOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    // Load both images in parallel
    const [sourceImage, logo] = await Promise.all([
      loadImage(imageSrc),
      loadLogo()
    ]);

    // Create canvas with source image dimensions
    const canvas = document.createElement('canvas');
    canvas.width = sourceImage.width;
    canvas.height = sourceImage.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Draw the source image
    ctx.drawImage(sourceImage, 0, 0);

    // Calculate logo dimensions (maintain aspect ratio)
    const logoWidth = sourceImage.width * (opts.scale || 0.15);
    const logoHeight = (logo.height / logo.width) * logoWidth;

    // Calculate position
    let x: number;
    let y: number;
    const margin = opts.margin || 15;

    switch (opts.position) {
      case 'top-left':
        x = margin;
        y = margin;
        break;
      case 'top-right':
        x = sourceImage.width - logoWidth - margin;
        y = margin;
        break;
      case 'bottom-left':
        x = margin;
        y = sourceImage.height - logoHeight - margin;
        break;
      case 'center':
        x = (sourceImage.width - logoWidth) / 2;
        y = (sourceImage.height - logoHeight) / 2;
        break;
      case 'bottom-right':
      default:
        x = sourceImage.width - logoWidth - margin;
        y = sourceImage.height - logoHeight - margin;
        break;
    }

    // Set opacity and draw logo
    ctx.globalAlpha = opts.opacity || 0.7;
    ctx.drawImage(logo, x, y, logoWidth, logoHeight);
    ctx.globalAlpha = 1;

    // Return as base64
    // Use same format as source if possible, fallback to PNG
    const format = imageSrc.includes('image/jpeg') || imageSrc.includes('image/jpg')
      ? 'image/jpeg'
      : 'image/png';
    const quality = format === 'image/jpeg' ? 0.92 : undefined;

    return canvas.toDataURL(format, quality);
  } catch (error) {
    console.error('Error adding watermark:', error);
    // Return original image if watermarking fails
    return imageSrc;
  }
}

/**
 * Check if an image already has dimensions that suggest it might be a thumbnail or icon
 * Small images (< 200px) won't get watermarked
 */
export function shouldWatermark(imageSrc: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Don't watermark very small images (icons, thumbnails)
      resolve(img.width >= 200 && img.height >= 200);
    };
    img.onerror = () => resolve(false);
    img.src = imageSrc;
  });
}
