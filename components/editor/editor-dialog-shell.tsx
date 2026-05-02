import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface EditorDialogShellProps {
  title: string;
  description?: string;
  children?: ReactNode;
  footerActions?: ReactNode;
  className?: string;
}

export function EditorDialogShell({
  title,
  description,
  children,
  footerActions,
  className,
}: EditorDialogShellProps) {
  return (
    <section
      className={cn(
        "w-full max-w-md rounded-3xl border border-surface-border bg-elevated p-6 text-copy-primary shadow-2xl",
        className,
      )}
    >
      <div className="space-y-2">
        <h2 className="text-lg font-semibold leading-7 text-copy-primary">
          {title}
        </h2>
        {description ? (
          <p className="text-sm leading-6 text-copy-muted">{description}</p>
        ) : null}
      </div>

      {children ? <div className="mt-6">{children}</div> : null}

      {footerActions ? (
        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-surface-border pt-4 sm:flex-row sm:justify-end">
          {footerActions}
        </div>
      ) : null}
    </section>
  );
}
