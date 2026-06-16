import { createFileRoute, redirect } from "@tanstack/react-router";

import { createThread, readThreads } from "@/lib/chat-store";

export const Route = createFileRoute("/chat/")({
  head: () => ({
    meta: [{ title: "AI Chatbot — Workly AI" }],
  }),
  component: () => null,
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const threads = readThreads();
    const target = threads[0] ?? createThread();
    throw redirect({ to: "/chat/$threadId", params: { threadId: target.id } });
  },
});
