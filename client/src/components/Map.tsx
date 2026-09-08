/**
 * GOOGLE MAPS FRONTEND INTEGRATION - ESSENTIAL GUIDE
 *
 * Uses direct Google Maps API with project API key.
 * Falls back to Manus Forge proxy if VITE_GOOGLE_MAPS_API_KEY is not set.
 *
 * USAGE FROM PARENT COMPONENT:
 * ======
 *
 * const mapRef = useRef<google.maps.Map | null>(null);
 *
 * <MapView
 *   initialCenter={{ lat: 40.7128, lng: -74.0060 }}
 *   initialZoom={15}
 *   onMapReady={(map) => {
 *     mapRef.current = map;
 *   }}
 * />
 *
 * ======
 */

/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState } from "react";
import { usePersistFn } from "@/hooks/usePersistFn";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google?: typeof google;
    _googleMapsLoading?: Promise<void>;
  }
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const FORGE_API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL =
  import.meta.env.VITE_FRONTEND_FORGE_API_URL ||
  "https://forge.butterfly-effect.dev";
const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;

function getMapScriptUrl(): string {
  if (GOOGLE_MAPS_API_KEY) {
    return `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=weekly&libraries=marker,places,geocoding,geometry`;
  }
  return `${MAPS_PROXY_URL}/maps/api/js?key=${FORGE_API_KEY}&v=weekly&libraries=marker,places,geocoding,geometry`;
}

function loadMapScript(): Promise<void> {
  if (window.google?.maps) {
    return Promise.resolve();
  }
  if (window._googleMapsLoading) {
    return window._googleMapsLoading;
  }

  window._googleMapsLoading = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = getMapScriptUrl();
    script.async = true;
    script.defer = true;
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      window._googleMapsLoading = undefined;
      reject(new Error("Failed to load Google Maps"));
    };
    document.head.appendChild(script);
  });

  return window._googleMapsLoading;
}

interface MapViewProps {
  className?: string;
  initialCenter?: google.maps.LatLngLiteral;
  initialZoom?: number;
  onMapReady?: (map: google.maps.Map) => void;
}

export function MapView({
  className,
  initialCenter = { lat: 37.7749, lng: -122.4194 },
  initialZoom = 12,
  onMapReady,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [hasKey, setHasKey] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const init = usePersistFn(async () => {
    const keyExists = Boolean(GOOGLE_MAPS_API_KEY || FORGE_API_KEY);
    if (!keyExists) {
      setHasKey(false);
      return;
    }
    try {
      await loadMapScript();
    } catch (e) {
      setLoadError(true);
      return;
    }
    if (!mapContainer.current) {
      return;
    }
    if (!window.google?.maps) {
      setLoadError(true);
      return;
    }
    map.current = new window.google.maps.Map(mapContainer.current, {
      zoom: initialZoom,
      center: initialCenter,
      mapTypeControl: false,
      fullscreenControl: false,
      zoomControl: true,
      streetViewControl: false,
    });
    if (onMapReady) {
      onMapReady(map.current);
    }
  });

  useEffect(() => {
    init();
  }, [init]);

  if (!hasKey || loadError) {
    return (
      <div className={cn("w-full h-[300px] flex items-center justify-center rounded-xl bg-[#1a1040]/80 border border-purple-500/20 p-6 text-center", className)}>
        <div>
          <div className="text-3xl mb-2">🗺️</div>
          <p className="text-purple-200 text-sm font-semibold">Couldn't load the map. Please check your internet connection.</p>
          <p className="text-gray-400 text-xs mt-1">Map unavailable. Please check your connection.</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapContainer} className={cn("w-full h-[500px]", className)} />
  );
}
