import { Copy, Download, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ResponsibleAINotice } from "./responsible-ai-notice";

interface Props {
  value: string;
  onChange?: (next: string) => void;
  onRegenerate?: () => void;
  regenerating?: boolean;
  downloadFilename?: string;
  rows?: number;
}

export function EditableAIOutput({
  value,
  onChange,
  onRegenerate,
  regenerating,
  downloadFilename = "ai-output.txt",
  rows = 16,
}: Props) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);

  const handleChange = (next: string) => {
    setLocal(next);
    onChange?.(next);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(local);
    toast.success("Copied to clipboard");
  };

  const download = () => {
    const blob = new Blob([local], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl border bg-card p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Generated output</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copy}>
            <Copy className="h-3.5 w-3.5" /> Copy
          </Button>
          <Button variant="outline" size="sm" onClick={download}>
            <Download className="h-3.5 w-3.5" /> Save
          </Button>
          {onRegenerate && (
            <Button variant="outline" size="sm" onClick={onRegenerate} disabled={regenerating}>
              <RotateCcw className="h-3.5 w-3.5" /> Regenerate
            </Button>
          )}
        </div>
      </div>
      <Textarea
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        rows={rows}
        className="resize-y font-mono text-sm leading-relaxed"
      />
      <ResponsibleAINotice />
    </div>
  );
}
