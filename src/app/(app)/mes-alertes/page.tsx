import { getAlertConfig } from "@/lib/actions/alertes";
import { AlertesForm } from "./AlertesForm";

export const metadata = {
  title: "Mes alertes — SportVoisin",
};

export default async function MesAlertesPage() {
  const config = await getAlertConfig();
  return <AlertesForm defaultConfig={config} />;
}
