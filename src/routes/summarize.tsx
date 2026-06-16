import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EditableAIOutput } from "@/components/editable-ai-output";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { summarizeNotes } from "@/lib/ai.functions";
import { useGenerations } from "@/lib/generations-store";

export const Route = createFileRoute("/summarize")({
  head: () => ({
    meta: [
      { title: "Meeting Summarizer — Workly AI" },
      { name: "description", content: "Convert long meeting notes into clear action items." },
    ],
  }),
  component: SummarizePage,
});

function SummarizePage() {
  const run = useServerFn(summarizeNotes);
  const { save } = useGenerations();
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (notes.trim().length < 10) {
      toast.error("Paste in some meeting notes first");
      return;
    }
    setLoading(true);
    try {
      const { text } = await run({ data: { notes } });
      setOutput(text);
      const title = notes.trim().split("\n")[0].slice(0, 60) || "Meeting summary";
      save({ type: "summary", title, output: text });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Meeting Summarizer"
        description="Turn raw notes into key points, decisions, and action items."
      />
      <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <Card className="shadow-soft">
          <CardContent className="space-y-4 p-6">
            <div className="space-y-1.5">
              <Label htmlFor="notes">Meeting notes</Label>
              <Textarea
                id="notes"
                rows={12}
                placeholder="Paste raw meeting notes, transcript, or bullet points here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <Button onClick={generate} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {loading ? "Summarizing..." : "Summarize notes"}
            </Button>
          </CardContent>
        </Card>

        {output && (
          <EditableAIOutput
            value={output}
            onChange={setOutput}
            onRegenerate={generate}
            regenerating={loading}
            downloadFilename="meeting-summary.txt"
          />
        )}
      </main>
    </>
  );
}
