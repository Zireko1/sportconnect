"use client";

import { useCallback, useEffect, useState } from "react";

export interface UserLocation {
  lat: number;
  lon: number;
  /** Nom de la commune détectée (ou ville du profil) */
  label: string | null;
  source: "gps" | "profile";
}

export interface ProfileLocation {
  city: string | null;
  latitude: number | null;
  longitude: number | null;
}

type StoredLocation = UserLocation & { ts: number };
export type GeoStatus = "idle" | "locating" | "denied" | "unavailable";

const STORAGE_KEY = "sv:location";
const CHANGE_EVENT = "sv:location-change";
/** Au-delà, on rafraîchit silencieusement la position si la permission est déjà accordée */
const REFRESH_AFTER_MS = 24 * 60 * 60 * 1000;

function readStored(): StoredLocation | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as StoredLocation;
    return typeof v.lat === "number" && typeof v.lon === "number" ? v : null;
  } catch {
    return null;
  }
}

function writeStored(v: StoredLocation | null) {
  try {
    if (v) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // stockage indisponible (navigation privée…) : la position reste en mémoire
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: v }));
}

/**
 * Nom de la commune à partir de coordonnées.
 * France : geo.api.gouv.fr (renvoie [] hors de France) — Suisse : swisstopo.
 * Mêmes fournisseurs que l'autocomplétion des villes.
 */
async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  const fr = fetch(`https://geo.api.gouv.fr/communes?lat=${lat}&lon=${lon}&fields=nom`)
    .then((r) => (r.ok ? r.json() : []))
    .then((j: Array<{ nom: string }>) => j[0]?.nom ?? null)
    .catch(() => null);
  const ch = fetch(
    `https://api3.geo.admin.ch/rest/services/api/MapServer/identify?geometryType=esriGeometryPoint&geometry=${lon},${lat}&sr=4326&layers=all:ch.swisstopo-vd.ortschaftenverzeichnis_plz&tolerance=0&returnGeometry=false&lang=fr`
  )
    .then((r) => (r.ok ? r.json() : {}))
    .then((j: { results?: Array<{ attributes?: { langtext?: string } }> }) => j.results?.[0]?.attributes?.langtext ?? null)
    .catch(() => null);
  const [frName, chName] = await Promise.all([fr, ch]);
  return frName ?? chName;
}

/**
 * Position de l'utilisateur, partagée entre composants via localStorage
 * + un événement window (plusieurs instances restent synchronisées).
 * Repli sur la ville du profil si pas de géoloc (refus, indisponible…).
 */
export function useUserLocation(profile?: ProfileLocation | null) {
  const [stored, setStored] = useState<StoredLocation | null>(null);
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [ready, setReady] = useState(false);

  const locate = useCallback((silent = false) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      if (!silent) setStatus("unavailable");
      return;
    }
    if (!silent) setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Math.round(pos.coords.latitude * 1e4) / 1e4; // ~10 m, suffisant
        const lon = Math.round(pos.coords.longitude * 1e4) / 1e4;
        const label = await reverseGeocode(lat, lon);
        writeStored({ lat, lon, label, source: "gps", ts: Date.now() });
        setStatus("idle");
      },
      (err) => {
        if (!silent) setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 }
    );
  }, []);

  useEffect(() => {
    const current = readStored();
    setStored(current);
    setReady(true);

    const sync = () => setStored(readStored());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);

    // Permission déjà accordée : on rafraîchit sans rien demander
    if (!current || Date.now() - current.ts > REFRESH_AFTER_MS) {
      navigator.permissions
        ?.query({ name: "geolocation" as PermissionName })
        .then((p) => {
          if (p.state === "granted") locate(true);
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [locate]);

  const clear = useCallback(() => writeStored(null), []);

  const profileLocation: UserLocation | null =
    profile && typeof profile.latitude === "number" && typeof profile.longitude === "number"
      ? { lat: profile.latitude, lon: profile.longitude, label: profile.city, source: "profile" }
      : null;

  const location: UserLocation | null = stored
    ? { lat: stored.lat, lon: stored.lon, label: stored.label, source: stored.source }
    : profileLocation;

  return { location, status, ready, request: () => locate(false), clear };
}
