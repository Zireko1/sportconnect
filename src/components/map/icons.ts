import L from "leaflet";

// Icônes SVG inline : évite le bug des icônes par défaut de Leaflet avec webpack.
// À n'importer que depuis des modules chargés côté client (dynamic ssr:false).

/** Vert SportVoisin des markers */
export const GREEN = "#3aaa5c";

/** Pin rond vert SportVoisin */
export const annonceIcon = L.divIcon({
  className: "",
  html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M15 1C7.3 1 1 7.2 1 14.9 1 25.3 15 39 15 39s14-13.7 14-24.1C29 7.2 22.7 1 15 1z" fill="${GREEN}" stroke="#fff" stroke-width="2"/>
    <circle cx="15" cy="15" r="5.5" fill="#fff"/>
  </svg>`,
  iconSize: [30, 40],
  iconAnchor: [15, 39],
  popupAnchor: [0, -34],
});
