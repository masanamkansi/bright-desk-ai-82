import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EditableAIOutput } from "@/components/editable-ai-output";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { generateEmail } from "@/lib/ai.functions";
import { useGenerations } from "@/lib/generations-store";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Workly AI" },
      { name: "description", content: "Draft professional emails in seconds with AI." },
    ],
  }),
  component: EmailPage,
});

type Tone = "formal" | "friendly" | "persuasive";

function EmailPage() {
  const run = useServerFn(generateEmail);
  const { save } = useGenerations();
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState<Tone>("formal");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!recipient || !subject || !purpose) {
      toast.error("Fill in recipient, subject and purpose");
      return;
    }
    setLoading(true);
    try {
      const { text } = await run({ data: { recipient, subject, purpose, tone } });
      setOutput(text);
      save({ type: "email", title: subject, output: text });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Smart Email Generator"
        description="Generate professional emails with the right tone."
      />
      <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <Card className="shadow-soft">
          <CardContent className="grid gap-4 p-6 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                placeholder="Sarah Lee, Marketing Director"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Project update"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Textarea
                id="purpose"
                rows={4}
                placeholder="Share Q3 milestones, ask for feedback on the timeline, and schedule a 30-min sync next week."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end md:col-span-2">
              <Button onClick={generate} disabled={loading} className="w-full md:w-auto">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {loading ? "Generating..." : "Generate email"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {output && (
          <EditableAIOutput
            value={output}
            onChange={setOutput}
            onRegenerate={generate}
            regenerating={loading}
            downloadFilename={`email-${subject.slice(0, 30) || "draft"}.txt`}
          />
        )}
      </main>
    </>
  );
}
