"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import L from "leaflet";
import "leaflet.markercluster";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import { SPORT_EMOJI, SPORT_LABEL } from "@/components/ui/Badge";
import { useUserLocation } from "@/lib/hooks/useUserLocation";
import type { AnnonceMapProps, MapAnnonce } from "./AnnonceMap";

const DEFAULT_CENTER: [number, number] = [45.8992, 6.1294]; // Annecy
const DEFAULT_ZOOM = 11;
const GREEN = "#3aaa5c";
const BLUE = "#2563eb";

// Icônes SVG inline : évite le bug des icônes par défaut de Leaflet avec webpack.
const annonceIcon = L.divIcon({
  className: "",
  html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M15 1C7.3 1 1 7.2 1 14.9 1 25.3 15 39 15 39s14-13.7 14-24.1C29 7.2 22.7 1 15 1z" fill="${GREEN}" stroke="#fff" stroke-width="2"/>
    <circle cx="15" cy="15" r="5.5" fill="#fff"/>
  </svg>`,
  iconSize: [30, 40],
  iconAnchor: [15, 39],
  popupAnchor: [0, -34],
});

const userIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:${BLUE};border:3px solid #fff;box-shadow:0 0 0 6px rgba(37,99,235,.25),0 1px 4px rgba(0,0,0,.3)"></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function clusterIcon(cluster: L.MarkerCluster) {
  const n = cluster.getChildCount();
  const size = n < 10 ? 36 : n < 50 ? 42 : 50;
  return L.divIcon({
    className: "",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:9999px;background:${GREEN};color:#fff;font:700 14px/1 system-ui,sans-serif;border:3px solid #fff;box-shadow:0 0 0 4px rgba(58,170,92,.3),0 1px 4px rgba(0,0,0,.25)">${n}</span>`,
    iconSize: [size, size],
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris",
});

function popupHtml(a: MapAnnonce) {
  const emoji = a.sport === "autre" ? "🏅" : SPORT_EMOJI[a.sport] ?? "🏅";
  const label = a.sport === "autre" ? a.sportCustom ?? "Autre sport" : SPORT_LABEL[a.sport] ?? a.sport;
  const lines = [
    `<p style="margin:0 0 6px;font:700 15px/1.3 system-ui,sans-serif;color:#1a2e1a">${emoji} ${escapeHtml(label)}</p>`,
    `<p style="margin:0;font:400 14px/1.5 system-ui,sans-serif;color:#444">📅 ${escapeHtml(dateFormatter.format(new Date(a.dateTime)))}</p>`,
    `<p style="margin:0;font:400 14px/1.5 system-ui,sans-serif;color:#444">📍 ${escapeHtml(a.city)}</p>`,
    a.organizer ? `<p style="margin:0;font:400 14px/1.5 system-ui,sans-serif;color:#444">👤 ${escapeHtml(a.organizer)}</p>` : "",
    `<a href="/annonce/${encodeURIComponent(a.id)}" data-sv-link style="display:flex;align-items:center;justify-content:center;min-height:44px;margin-top:10px;padding:0 16px;border-radius:10px;background:${GREEN};color:#fff;font:600 14px/1 system-ui,sans-serif;text-decoration:none">Voir l'annonce</a>`,
  ];
  return `<div style="min-width:200px">${lines.join("")}</div>`;
}

/** Couche de markers regroupés (leaflet.markercluster) */
function AnnonceClusters({ annonces }: { annonces: MapAnnonce[] }) {
  const map = useMap();
  const router = useRouter();

  useEffect(() => {
    const group = L.markerClusterGroup({
      iconCreateFunction: clusterIcon,
      showCoverageOnHover: false,
      maxClusterRadius: 50,
    });
    for (const a of annonces) {
      L.marker([a.lat, a.lon], { icon: annonceIcon, title: a.city })
        .bindPopup(popupHtml(a), { maxWidth: 260 })
        .addTo(group);
    }
    map.addLayer(group);
    return () => {
      map.removeLayer(group);
    };
  }, [annonces, map]);

  // Lien du popup : navigation côté client plutôt que rechargement complet
  useEffect(() => {
    const onOpen = (e: L.PopupEvent) => {
      const link = e.popup.getElement()?.querySelector<HTMLAnchorElement>("a[data-sv-link]");
      if (!link) return;
      link.onclick = (ev) => {
        if (ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
        ev.preventDefault();
        router.push(link.getAttribute("href")!);
      };
    };
    map.on("popupopen", onOpen);
    return () => {
      map.off("popupopen", onOpen);
    };
  }, [map, router]);

  return null;
}

/** Recentre la carte quand la position connue change (géoloc obtenue, profil…) */
function FollowLocation({ lat, lon }: { lat?: number; lon?: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat === undefined || lon === undefined) return;
    map.setView([lat, lon], Math.max(map.getZoom(), DEFAULT_ZOOM));
  }, [lat, lon, map]);
  return null;
}

export default function LeafletMap({ annonces, profile }: AnnonceMapProps) {
  const { location, status, request } = useUserLocation(profile);
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTouch, setIsTouch] = useState(false);
  // Écrans tactiles : la carte n'intercepte les gestes qu'après un tap,
  // pour que le défilement de la page ne soit pas capturé par la carte.
  const [active, setActive] = useState(false);
  const pendingRecenter = useRef(false);

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // Désactive la carte quand on touche ailleurs sur la page
  useEffect(() => {
    if (!isTouch || !active) return;
    const onTouch = (e: TouchEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setActive(false);
    };
    document.addEventListener("touchstart", onTouch, { passive: true });
    return () => document.removeEventListener("touchstart", onTouch);
  }, [isTouch, active]);

  // Recentrage demandé avant que la géoloc ne réponde
  useEffect(() => {
    if (pendingRecenter.current && location?.source === "gps") {
      pendingRecenter.current = false;
      mapRef.current?.flyTo([location.lat, location.lon], Math.max(mapRef.current.getZoom(), 13));
    }
  }, [location]);

  function recenter() {
    if (location?.source === "gps") {
      mapRef.current?.flyTo([location.lat, location.lon], Math.max(mapRef.current.getZoom(), 13));
    } else {
      pendingRecenter.current = true;
      request();
    }
  }

  const center: [number, number] = location ? [location.lat, location.lon] : DEFAULT_CENTER;

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={!isTouch}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <AnnonceClusters annonces={annonces} />
        <FollowLocation lat={location?.lat} lon={location?.lon} />
        {location?.source === "gps" && (
          <Marker position={[location.lat, location.lon]} icon={userIcon} zIndexOffset={1000}>
            <Tooltip permanent direction="top" offset={[0, -12]}>
              Vous êtes ici
            </Tooltip>
          </Marker>
        )}
      </MapContainer>

      {/* Bouton Recentrer */}
      <button
        type="button"
        onClick={recenter}
        className="absolute top-3 right-3 z-[1000] bg-white/95 hover:bg-white shadow-card rounded-pill px-3 min-h-[36px] font-dm text-xs font-medium text-green-dark border border-[#d1e8d4]"
      >
        {status === "locating" ? "Localisation…" : "📍 Recentrer"}
      </button>

      {status === "denied" && (
        <p className="absolute top-14 right-3 z-[1000] max-w-[200px] bg-white/95 shadow-card rounded-card px-3 py-2 font-dm text-[11px] text-text-secondary">
          Géolocalisation refusée{profile?.city ? ` — carte centrée sur ${profile.city}` : ""}.
        </p>
      )}

      {annonces.length === 0 && (
        <p className="absolute bottom-3 left-3 z-[1000] max-w-[60%] bg-white/95 shadow-card rounded-pill px-3 py-1.5 font-dm text-xs text-text-secondary">
          Aucune annonce géolocalisée pour l&apos;instant
        </p>
      )}

      {/* Tactile : un tap active la carte, le défilement de la page reste libre */}
      {isTouch && !active && (
        <button
          type="button"
          onClick={() => setActive(true)}
          className="absolute inset-0 z-[999] flex items-center justify-center bg-transparent"
          aria-label="Activer la carte"
        >
          <span className="bg-black/60 text-white font-dm text-xs px-3 py-1.5 rounded-pill">
            Touchez pour explorer la carte
          </span>
        </button>
      )}
    </div>
  );
}
