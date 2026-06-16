import { useChat } from "@ai-sdk/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { PageHeader } from "@/components/page-header";
import { ResponsibleAINotice } from "@/components/responsible-ai-notice";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  createThread,
  deleteThread,
  readMessages,
  updateThread,
  useThreads,
  writeMessages,
} from "@/lib/chat-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat/$threadId")({
  head: () => ({
    meta: [
      { title: "AI Chatbot — Workly AI" },
      { name: "description", content: "Chat with your workplace productivity AI assistant." },
    ],
  }),
  component: ChatPage,
});

const SUGGESTIONS = [
  "Help me prepare for tomorrow's client meeting.",
  "Draft a polite follow-up to a delayed vendor.",
  "Summarize my week's priorities into 3 themes.",
  "Brainstorm a Q4 OKR for a marketing team.",
];

function ChatPage() {
  const { threadId } = Route.useParams();
  const navigate = useNavigate();
  const { threads } = useThreads();

  // Ensure thread exists in store (created on first visit/url)
  useEffect(() => {
    if (!threads.some((t) => t.id === threadId)) {
      const fresh = readMessages(threadId);
      // Register a new thread entry preserving the URL id
      const existing = JSON.parse(localStorage.getItem("wpa:chat:threads") ?? "[]");
      const next = [
        { id: threadId, title: "New conversation", updatedAt: Date.now() },
        ...existing,
      ];
      localStorage.setItem("wpa:chat:threads", JSON.stringify(next));
      window.dispatchEvent(new Event("wpa:threads-changed"));
      // ensure messages key exists
      if (fresh.length === 0) writeMessages(threadId, []);
    }
  }, [threadId, threads]);

  const initial = useMemo(() => readMessages(threadId), [threadId]);

  return (
    <>
      <PageHeader title="AI Chatbot" description="Your workplace productivity assistant." />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <ThreadList
          activeId={threadId}
          onNew={() => {
            const t = createThread();
            navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
          }}
          onDelete={(id) => {
            deleteThread(id);
            if (id === threadId) {
              const remaining = readMessages.length;
              void remaining;
              navigate({ to: "/chat" });
            }
          }}
        />
        <ChatWindow key={threadId} threadId={threadId} initialMessages={initial} />
      </div>
    </>
  );
}

function ThreadList({
  activeId,
  onNew,
  onDelete,
}: {
  activeId: string;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  const { threads } = useThreads();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card/50 md:flex md:flex-col">
      <div className="flex items-center justify-between px-3 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Conversations
        </h2>
        <Button size="icon-sm" variant="ghost" onClick={onNew} title="New conversation">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <ul className="space-y-0.5 px-2 pb-3">
          {threads.length === 0 && (
            <li className="px-2 py-1.5 text-xs text-muted-foreground">No conversations yet.</li>
          )}
          {threads.map((t) => (
            <li key={t.id} className="group/row relative">
              <Link
                to="/chat/$threadId"
                params={{ threadId: t.id }}
                className={cn(
                  "block truncate rounded-md px-2 py-2 pr-8 text-sm transition hover:bg-muted",
                  t.id === activeId && "bg-muted font-medium text-foreground",
                )}
              >
                {t.title}
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(t.id);
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover/row:opacity-100"
                title="Delete conversation"
                aria-label="Delete conversation"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </aside>
  );
}

function ChatWindow({
  threadId,
  initialMessages,
}: {
  threadId: string;
  initialMessages: UIMessage[];
}) {
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (e) => console.error(e),
  });

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [titled, setTitled] = useState(initialMessages.length > 0);

  // Persist messages whenever they change
  useEffect(() => {
    writeMessages(threadId, messages);
    if (messages.length > 0) {
      updateThread(threadId, { updatedAt: Date.now() });
    }
    // Auto-title from first user message
    if (!titled) {
      const first = messages.find((m) => m.role === "user");
      if (first) {
        const txt = first.parts
          .map((p) => (p.type === "text" ? p.text : ""))
          .join(" ")
          .trim();
        if (txt) {
          updateThread(threadId, { title: txt.slice(0, 50) });
          setTitled(true);
        }
      }
    }
  }, [messages, threadId, titled]);

  // Autofocus
  useEffect(() => {
    textareaRef.current?.focus();
  }, [threadId, status]);

  const isLoading = status === "submitted" || status === "streaming";

  const send = (text: string) => {
    if (!text.trim() || isLoading) return;
    void sendMessage({ text: text.trim() });
  };

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<MessageSquare className="h-10 w-10 text-primary" />}
              title="How can I help you today?"
              description="Try one of these prompts or type your own."
            >
              <div className="mt-4 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-lg border bg-card px-3 py-2 text-left text-sm shadow-soft transition hover:border-primary/40 hover:bg-muted"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((m) => {
              const text = m.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              return (
                <Message key={m.id} from={m.role}>
                  <MessageContent>
                    {m.role === "assistant" ? (
                      <MessageResponse>{text}</MessageResponse>
                    ) : (
                      <span className="whitespace-pre-wrap">{text}</span>
                    )}
                  </MessageContent>
                </Message>
              );
            })
          )}
          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent>
                <Shimmer>Thinking...</Shimmer>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t bg-background/80 p-3 sm:p-4">
        <PromptInput
          onSubmit={(message) => {
            send(message.text);
            // Clearing handled by PromptInput internally on submit
          }}
        >
          <PromptInputTextarea
            ref={textareaRef}
            placeholder="Ask Workly anything about your workday..."
            autoFocus
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} disabled={isLoading} />
          </PromptInputFooter>
        </PromptInput>
        <div className="mt-2">
          <ResponsibleAINotice />
        </div>
      </div>
    </section>
  );
}
