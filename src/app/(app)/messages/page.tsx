import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

type Conversation = {
  key: string;
  annonceId: string;
  annonceTitle: string;
  annonceOrganizerId: string;
  interlocutorId: string;
  interlocutorName: string;
  interlocutorAvatar: string | null;
  lastMessage: MessageRow;
  unreadCount: number;
};

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  // Fetch raw messages
  const { data: rawMessages } = await supabase
    .from("messages")
    .select("id, annonce_id, sender_id, receiver_id, content, read, created_at")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const messages = (rawMessages ?? []) as MessageRow[];

  // Collect unique IDs
  const annonceIds = [...new Set(messages.map((m) => m.annonce_id))];
  const userIds = [
    ...new Set([...messages.map((m) => m.sender_id), ...messages.map((m) => m.receiver_id)]),
  ].filter((uid) => uid !== user.id);

  // Parallel fetches
  const [{ data: annonces }, { data: users }] = await Promise.all([
    annonceIds.length
      ? supabase.from("annonces").select("id, title, organizer_id").in("id", annonceIds)
      : Promise.resolve({ data: [] }),
    userIds.length
      ? supabase.from("users").select("id, name, avatar_url").in("id", userIds)
      : Promise.resolve({ data: [] }),
  ]);

  const annonceMap = new Map((annonces ?? []).map((a) => [a.id, a]));
  const userMap = new Map(
    (users ?? []).map((u) => [u.id, u as { id: string; name: string; avatar_url: string | null }])
  );

  // Pre-count unread messages per conversation
  const unreadByKey: Record<string, number> = {};
  for (const msg of messages) {
    if (!msg.read && msg.receiver_id === user.id) {
      const key = `${msg.annonce_id}::${msg.sender_id}`;
      unreadByKey[key] = (unreadByKey[key] ?? 0) + 1;
    }
  }

  // Build conversation list (one entry per annonce + interlocutor, latest message first)
  const seen = new Set<string>();
  const conversations: Conversation[] = [];

  for (const msg of messages) {
    const interlocutorId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
    const key = `${msg.annonce_id}::${interlocutorId}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const annonce = annonceMap.get(msg.annonce_id);
    const interlocutor = userMap.get(interlocutorId);

    conversations.push({
      key,
      annonceId: msg.annonce_id,
      annonceTitle: annonce?.title ?? "Annonce supprimée",
      annonceOrganizerId: annonce?.organizer_id ?? "",
      interlocutorId,
      interlocutorName: interlocutor?.name ?? "Utilisateur",
      interlocutorAvatar: interlocutor?.avatar_url ?? null,
      lastMessage: msg,
      unreadCount: unreadByKey[`${msg.annonce_id}::${interlocutorId}`] ?? 0,
    });
  }

  const totalUnread = Object.values(unreadByKey).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-syne font-bold text-2xl text-text-primary">Messages</h1>
        {totalUnread > 0 && (
          <span className="bg-green-alpine text-white font-dm text-xs font-bold px-2 py-0.5 rounded-full">
            {totalUnread}
          </span>
        )}
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 bg-green-light rounded-full flex items-center justify-center mx-auto mb-4">
            <ChatEmptyIcon />
          </div>
          <p className="font-syne font-bold text-text-primary mb-1">Aucun message</p>
          <p className="font-dm text-sm text-text-secondary mb-4">
            Contactez un organisateur depuis une annonce pour démarrer une conversation.
          </p>
          <Link
            href="/"
            className="font-dm text-sm text-green-alpine hover:text-green-dark transition-colors"
          >
            Explorer les annonces →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            // If current user is organizer, link with ?withUser= so the chat opens
            const isOrganizerOfAnnonce = conv.annonceOrganizerId === user.id;
            const href = isOrganizerOfAnnonce
              ? `/annonce/${conv.annonceId}?withUser=${conv.interlocutorId}`
              : `/annonce/${conv.annonceId}`;

            const initials = conv.interlocutorName
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            const isLastMine = conv.lastMessage.sender_id === user.id;
            const hasUnread = conv.unreadCount > 0;

            return (
              <Link
                key={conv.key}
                href={href}
                className="flex items-center gap-3 bg-surface rounded-card shadow-card p-4 hover:bg-green-light transition-colors"
              >
                {/* Avatar */}
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-green-alpine flex items-center justify-center overflow-hidden">
                  {conv.interlocutorAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={conv.interlocutorAvatar}
                      alt={conv.interlocutorName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-syne font-bold text-white text-sm">{initials}</span>
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="font-syne font-bold text-sm text-text-primary truncate">
                      {conv.interlocutorName}
                    </p>
                    <span className="font-dm text-[11px] text-text-secondary flex-shrink-0">
                      {new Date(conv.lastMessage.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <p className="font-dm text-[11px] text-text-secondary truncate mb-0.5">
                    {conv.annonceTitle}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`font-dm text-xs truncate ${
                        hasUnread ? "text-text-primary font-medium" : "text-text-secondary"
                      }`}
                    >
                      {isLastMine ? "Vous : " : ""}
                      {conv.lastMessage.content}
                    </p>
                    {hasUnread && (
                      <span className="flex-shrink-0 min-w-[20px] h-5 bg-green-alpine rounded-full flex items-center justify-center px-1">
                        <span className="font-dm text-[10px] font-bold text-white">
                          {conv.unreadCount}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ChatEmptyIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#2d9e4e"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
