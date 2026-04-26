import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { SportBadge, LevelBadge, StatusBadge } from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/Input";

export default function Home() {
  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="w-full max-w-sm mx-auto space-y-6">

        {/* Header */}
        <div className="text-center">
          <span className="font-syne font-bold text-3xl text-green-alpine">
            Sport<span className="text-green-dark">Connect</span>
          </span>
          <p className="font-dm text-text-secondary text-sm mt-1">
            Design system — étape 2 ✓
          </p>
        </div>

        {/* Buttons */}
        <Card>
          <CardBody className="space-y-3">
            <h2 className="font-syne font-bold text-base text-text-primary">Boutons</h2>
            <Button variant="primary">Rejoindre ce match</Button>
            <Button variant="secondary">Voir les détails</Button>
            <Button variant="ghost">Annuler</Button>
            <Button variant="primary" loading>Chargement…</Button>
          </CardBody>
        </Card>

        {/* Badges */}
        <Card>
          <CardBody className="space-y-3">
            <h2 className="font-syne font-bold text-base text-text-primary">Badges</h2>
            <div className="flex flex-wrap gap-2">
              <SportBadge sport="soccer_five" />
              <SportBadge sport="padel" />
              <SportBadge sport="trail" />
              <SportBadge sport="velo" />
            </div>
            <div className="flex flex-wrap gap-2">
              <LevelBadge level="debutant" />
              <LevelBadge level="intermediaire" />
              <LevelBadge level="confirme" />
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="open" />
              <StatusBadge status="full" />
              <StatusBadge status="cancelled" />
            </div>
          </CardBody>
        </Card>

        {/* Inputs */}
        <Card>
          <CardBody className="space-y-4">
            <h2 className="font-syne font-bold text-base text-text-primary">Formulaire</h2>
            <Input label="Titre de l'annonce" placeholder="Ex: Soccer Five dimanche matin" />
            <Select
              label="Sport"
              options={[
                { value: "soccer_five", label: "⚽ Soccer Five" },
                { value: "padel", label: "🎾 Padel" },
                { value: "trail", label: "🏃 Trail running" },
                { value: "velo", label: "🚴 Vélo de route" },
              ]}
            />
            <Input label="Champ avec erreur" placeholder="…" error="Ce champ est requis" />
          </CardBody>
        </Card>

        {/* Annonce card preview */}
        <Card highlighted>
          <CardBody>
            <div className="flex items-start justify-between mb-3">
              <SportBadge sport="padel" />
              <StatusBadge status="open" />
            </div>
            <h3 className="font-syne font-bold text-text-primary mb-1">
              Padel doubles — Annecy
            </h3>
            <p className="font-dm text-text-secondary text-sm mb-3">
              Dimanche 11 mai · 10h00 · Indoor Annecy
            </p>
            <div className="flex items-center gap-2 mb-4">
              <LevelBadge level="intermediaire" />
              <span className="font-dm text-text-secondary text-xs">2 places restantes</span>
            </div>
            <Button variant="primary" size="sm">Rejoindre</Button>
          </CardBody>
        </Card>

      </div>
    </main>
  );
}
