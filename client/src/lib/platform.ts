/**
 * Platform detection utility for Capacitor native vs web
 */
import { Capacitor } from '@capacitor/core';

/**
 * Returns true if running inside a native Capacitor app (iOS or Android)
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Returns the current platform: 'ios', 'android', or 'web'
 */
export function getPlatform(): 'ios' | 'android' | 'web' {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
}

/**
 * Returns true if running on iOS native
 */
export function isIOS(): boolean {
  return Capacitor.getPlatform() === 'ios';
}
