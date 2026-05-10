import { Card, CardBody } from "@/components/ui/Card";

export default function ConfirmationPage() {
  return (
    <Card>
      <CardBody className="p-6 text-center space-y-4">
        <div className="w-14 h-14 bg-navy-light rounded-full flex items-center justify-center mx-auto">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <div>
          <h1 className="font-syne font-bold text-xl text-text-primary">Vérifie tes emails</h1>
          <p className="font-dm text-text-secondary text-sm mt-2">
            On t&apos;a envoyé un lien de confirmation. Clique dessus pour activer ton compte.
          </p>
        </div>
        <p className="font-dm text-xs text-text-secondary">
          Pas reçu ?{" "}
          <a href="/inscription" className="text-navy hover:text-navy-dark">
            Réessayer
          </a>
        </p>
      </CardBody>
    </Card>
  );
}
