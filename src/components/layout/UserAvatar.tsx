import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { UserMenu } from "@/components/layout/UserMenu";
import type { Database } from "@/types/database";

type UserProfile = Pick<
  Database["public"]["Tables"]["users"]["Row"],
  "name" | "avatar_url"
>;

export async function UserAvatar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Link
        href="/connexion"
        className="font-dm text-sm font-medium text-green-alpine hover:text-green-dark transition-colors"
      >
        Connexion
      </Link>
    );
  }

  const { data } = await supabase
    .from("users")
    .select("name, avatar_url")
    .eq("id", user.id)
    .single();

  const profile = data as UserProfile | null;

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <UserMenu
      name={profile?.name ?? ""}
      avatarUrl={profile?.avatar_url ?? null}
      initials={initials}
    />
  );
}
