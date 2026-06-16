import { type ReactNode } from "react";

import { SidebarTrigger } from "@/components/ui/sidebar";

interface Props {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ title, description, children }: Props) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
      <SidebarTrigger />
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold sm:text-lg">{title}</h1>
        {description && (
          <p className="hidden text-xs text-muted-foreground sm:block">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </header>
  );
}
