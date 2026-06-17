import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { createThread, readThreads } from "@/lib/chat-store";

export const Route = createFileRoute("/chat/")({
  head: () => ({
    meta: [{ title: "AI Chatbot — Workly AI" }],
  }),
  component: ChatIndex,
});

function ChatIndex() {
  const navigate = useNavigate();

  useEffect(() => {
    const threads = readThreads();
    const target = threads[0] ?? createThread();
    navigate({ to: "/chat/$threadId", params: { threadId: target.id }, replace: true });
  }, [navigate]);

  return null;
}
