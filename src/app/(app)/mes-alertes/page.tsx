import { getAlertConfig } from "@/lib/actions/alertes";
import { createClient } from "@/lib/supabase/server";
import { AlertesForm } from "./AlertesForm";

export const metadata = {
  title: "Mes alertes — SportVoisin",
};

export default async function MesAlertesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [config, { data: profile }] = await Promise.all([
    getAlertConfig(),
    user
      ? supabase.from("users").select("city").eq("id", user.id).single()
      : Promise.resolve({ data: null }),
  ]);

  // Sans ville, le matching géographique est impossible : aucune alerte n'est envoyée.
  const missingCity = !!user && !profile?.city?.trim();

  return <AlertesForm defaultConfig={config} missingCity={missingCity} />;
}
