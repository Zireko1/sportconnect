"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  annonce_id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  read: boolean;
};

interface Props {
  annonceId: string;
  currentUserId: string;
  chatPartnerId: string;
  annonceTitle: string;
}

export function ChatPanel({ annonceId, currentUserId, chatPartnerId, annonceTitle }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load message history
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("messages")
        .select("id, content, sender_id, receiver_id, created_at, read")
        .eq("annonce_id", annonceId)
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${chatPartnerId}),` +
          `and(sender_id.eq.${chatPartnerId},receiver_id.eq.${currentUserId})`
        )
        .order("created_at");

      if (data) setMessages(data as Message[]);
      setLoading(false);
    }
    load();
  }, [annonceId, currentUserId, chatPartnerId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mark received messages as read
  useEffect(() => {
    const unread = messages.filter((m) => m.receiver_id === currentUserId && !m.read);
    if (!unread.length) return;
    const ids = unread.map((m) => m.id);
    supabase.from("messages").update({ read: true }).in("id", ids).then(() => {});
  }, [messages, currentUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${annonceId}-${[currentUserId, chatPartnerId].sort().join("-")}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as Message;
          if (
            msg.annonce_id !== annonceId ||
            !(
              (msg.sender_id === currentUserId && msg.receiver_id === chatPartnerId) ||
              (msg.sender_id === chatPartnerId && msg.receiver_id === currentUserId)
            )
          )
            return;

          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [annonceId, currentUserId, chatPartnerId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll on new messages
  useEffect(() => {
    if (!loading) scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  async function send() {
    const content = input.trim();
    if (!content || sending) return;

    setSending(true);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "40px";

    const { data: inserted } = await supabase
      .from("messages")
      .insert({
        annonce_id: annonceId,
        sender_id: currentUserId,
        receiver_id: chatPartnerId,
        content,
      })
      .select("id")
      .single();

    setSending(false);

    if (inserted) {
      // Fire-and-forget email notification
      fetch("/api/messages/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: inserted.id,
          annonceId,
          senderId: currentUserId,
          receiverId: chatPartnerId,
        }),
      });
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    // Auto-resize
    e.target.style.height = "40px";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
  }

  return (
    <div className="flex flex-col" style={{ height: 320 }}>
      {/* Context label */}
      <div className="px-4 py-2 border-b border-[#e0ebe2] bg-[#f0f8f2]">
        <p className="font-dm text-xs text-text-secondary truncate">
          À propos de <span className="font-medium text-text-primary">{annonceTitle}</span>
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-[#f8faf6]">
        {loading && (
          <p className="font-dm text-xs text-text-secondary text-center mt-4">Chargement…</p>
        )}
        {!loading && messages.length === 0 && (
          <p className="font-dm text-xs text-text-secondary text-center mt-8">
            Aucun message. Commencez la conversation !
          </p>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={[
                  "max-w-[75%] px-3 py-2 rounded-2xl font-dm text-sm leading-relaxed break-words",
                  isMine
                    ? "bg-[#2d9e4e] text-white rounded-br-sm"
                    : "bg-white border border-[#e0ebe2] text-text-primary rounded-bl-sm shadow-sm",
                ].join(" ")}
              >
                {msg.content}
                <span
                  className={`block text-[10px] mt-0.5 text-right ${
                    isMine ? "text-white/60" : "text-text-secondary"
                  }`}
                >
                  {new Date(msg.created_at).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#e0ebe2] px-3 py-2.5 flex items-end gap-2 bg-white">
        <textarea
          ref={textareaRef}
          className="flex-1 font-dm text-sm text-text-primary bg-[#f8faf6] border border-[#e0ebe2] rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-green-alpine placeholder:text-text-secondary/60 leading-relaxed"
          placeholder="Votre message…"
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          rows={1}
          style={{ minHeight: 40, maxHeight: 100 }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          aria-label="Envoyer"
          className="flex-shrink-0 w-9 h-9 bg-green-alpine rounded-full flex items-center justify-center disabled:opacity-40 hover:bg-green-dark transition-colors"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}

function SendIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
