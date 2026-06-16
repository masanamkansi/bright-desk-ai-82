import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { clearAllChats } from "@/lib/chat-store";
import { useGenerations } from "@/lib/generations-store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ title: "Settings — Workly AI" }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { clear } = useGenerations();

  return (
    <>
      <PageHeader title="Settings" description="Manage your local data and preferences." />
      <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <Card className="shadow-soft">
          <CardContent className="space-y-4 p-6">
            <div>
              <h3 className="text-base font-semibold">Local data</h3>
              <p className="text-sm text-muted-foreground">
                All generations and chat history are stored in this browser only.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  clear();
                  toast.success("Cleared generation history");
                }}
              >
                <Trash2 className="h-4 w-4" /> Clear generations
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  clearAllChats();
                  toast.success("Cleared all chats");
                }}
              >
                <Trash2 className="h-4 w-4" /> Clear chats
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="space-y-2 p-6 text-sm">
            <h3 className="text-base font-semibold">About Workly AI</h3>
            <p className="text-muted-foreground">
              A modern AI workplace productivity assistant. Generate emails, summarize meetings,
              plan your day, run quick research, and chat with an AI assistant — all in one
              dashboard.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
