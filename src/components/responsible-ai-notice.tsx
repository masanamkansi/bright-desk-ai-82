import { ShieldAlert } from "lucide-react";

export function ResponsibleAINotice() {
  return (
    <div className="mt-4 flex items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
      <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
      <p>
        <span className="font-medium text-foreground">Responsible AI notice — </span>
        This content was generated using Artificial Intelligence and may contain inaccuracies.
        Review, verify, and edit before sharing externally or making business decisions.
      </p>
    </div>
  );
}
