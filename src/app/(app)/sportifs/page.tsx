import { redirect } from "next/navigation";
import { getViewer } from "@/lib/viewer";
import { SportifsNearby } from "./SportifsNearby";

export const metadata = {
  title: "Sportifs autour de moi — SportVoisin",
  description: "Découvre les sportifs inscrits près de chez toi et propose-leur un match.",
};

export default async function SportifsPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/connexion");

  return (
    <div className="max-w-3xl mx-auto px-4 pt-12 lg:pt-8 pb-10 space-y-5">
      <header className="space-y-1">
        <h1 className="font-syne font-bold text-2xl text-text-primary">Sportifs autour de moi</h1>
        <p className="font-dm text-sm text-text-secondary">
          Les 20 sportifs les plus proches (50 km max). Seule une distance approximative est
          affichée, jamais d&apos;adresse.
        </p>
      </header>
      <SportifsNearby
        profile={{ city: viewer.city, latitude: viewer.latitude, longitude: viewer.longitude }}
        mySports={viewer.sports}
      />
    </div>
  );
}
