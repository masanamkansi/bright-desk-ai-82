import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Compass, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EditableAIOutput } from "@/components/editable-ai-output";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { researchTopic } from "@/lib/ai.functions";
import { useGenerations } from "@/lib/generations-store";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Assistant — Workly AI" },
      { name: "description", content: "Get instant summaries, insights, and recommendations." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const run = useServerFn(researchTopic);
  const { save } = useGenerations();
  const [topic, setTopic] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (topic.trim().length < 2) {
      toast.error("Enter a topic or paste an article");
      return;
    }
    setLoading(true);
    try {
      const { text } = await run({ data: { topic } });
      setOutput(text);
      save({ type: "research", title: topic.slice(0, 60), output: text });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Research Assistant"
        description="Topic summaries, key insights, and recommendations."
      />
      <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <Card className="shadow-soft">
          <CardContent className="space-y-4 p-6">
            <div className="space-y-1.5">
              <Label htmlFor="topic">Topic or article</Label>
              <Textarea
                id="topic"
                rows={8}
                placeholder="e.g. The impact of generative AI on knowledge workers..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <Button onClick={generate} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Compass className="h-4 w-4" />
              )}
              {loading ? "Researching..." : "Run research"}
            </Button>
          </CardContent>
        </Card>

        {output && (
          <EditableAIOutput
            value={output}
            onChange={setOutput}
            onRegenerate={generate}
            regenerating={loading}
            downloadFilename="research-report.txt"
          />
        )}
      </main>
    </>
  );
}
