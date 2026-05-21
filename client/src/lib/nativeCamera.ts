/**
 * Native Camera utility for Teenz Bible
 * 
 * Uses @capacitor/camera on native platforms (iOS/Android) for reliable camera access.
 * Falls back to HTML file input on web.
 * 
 * This fixes the iPad WKWebView camera crash issue (Apple Review Guideline 2.1a).
 */

import { isNativePlatform } from './platform';

export interface PhotoResult {
  base64: string; // data URL (data:image/jpeg;base64,...)
}

/**
 * Take a photo using native camera (iOS/Android) or return null to use web fallback
 */
export async function takePhotoNative(): Promise<PhotoResult | null> {
  if (!isNativePlatform()) {
    // On web, return null to signal that the caller should use HTML file input
    return null;
  }

  try {
    const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
    
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      correctOrientation: true,
      width: 800,
      height: 800,
    });

    if (image.dataUrl) {
      return { base64: image.dataUrl };
    }
    return null;
  } catch (error: any) {
    // User cancelled or camera not available
    console.log('[NativeCamera] Error:', error.message);
    if (error.message?.includes('cancelled') || error.message?.includes('canceled') || error.message?.includes('User cancelled')) {
      return null; // User cancelled, not an error
    }
    throw error;
  }
}

/**
 * Pick a photo from gallery using native picker (iOS/Android) or return null for web fallback
 */
export async function pickPhotoNative(): Promise<PhotoResult | null> {
  if (!isNativePlatform()) {
    return null;
  }

  try {
    const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
    
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
      correctOrientation: true,
      width: 800,
      height: 800,
    });

    if (image.dataUrl) {
      return { base64: image.dataUrl };
    }
    return null;
  } catch (error: any) {
    console.log('[NativeCamera] Gallery error:', error.message);
    if (error.message?.includes('cancelled') || error.message?.includes('canceled') || error.message?.includes('User cancelled')) {
      return null;
    }
    throw error;
  }
}
