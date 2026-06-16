import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, CalendarClock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EditableAIOutput } from "@/components/editable-ai-output";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { planTasks } from "@/lib/ai.functions";
import { useGenerations } from "@/lib/generations-store";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Workly AI" },
      { name: "description", content: "Turn your to-do list into a prioritized day plan." },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const run = useServerFn(planTasks);
  const { save } = useGenerations();
  const [tasks, setTasks] = useState("");
  const [hours, setHours] = useState("09:00 - 17:00");
  const [priority, setPriority] = useState("Client proposal is the top priority.");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (tasks.trim().length < 3) {
      toast.error("Add at least one task");
      return;
    }
    setLoading(true);
    try {
      const { text } = await run({ data: { tasks, hours, priority } });
      setOutput(text);
      save({ type: "plan", title: `Schedule for ${hours}`, output: text });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="AI Task Planner"
        description="Generate a prioritized daily schedule."
      />
      <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <Card className="shadow-soft">
          <CardContent className="space-y-4 p-6">
            <div className="space-y-1.5">
              <Label htmlFor="tasks">Task list</Label>
              <Textarea
                id="tasks"
                rows={6}
                placeholder={`Client proposal\nResearch project\nEmail responses\nTeam standup`}
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="hours">Available hours</Label>
                <Input
                  id="hours"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="09:00 - 17:00"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="priority">Priority notes</Label>
                <Input
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={generate} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CalendarClock className="h-4 w-4" />
              )}
              {loading ? "Planning..." : "Plan my day"}
            </Button>
          </CardContent>
        </Card>

        {output && (
          <EditableAIOutput
            value={output}
            onChange={setOutput}
            onRegenerate={generate}
            regenerating={loading}
            downloadFilename="daily-schedule.txt"
          />
        )}
      </main>
    </>
  );
}
