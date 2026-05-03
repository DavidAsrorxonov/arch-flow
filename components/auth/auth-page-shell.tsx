import type { ReactNode } from "react";

interface AuthPageShellProps {
  children: ReactNode;
}

const features = [
  "Protected project workspaces",
  "Collaborative system design canvas",
  "AI-assisted architecture specifications",
];

export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <main className="grid min-h-screen bg-base text-copy-primary lg:grid-cols-[minmax(0,0.9fr)_minmax(440px,1fr)]">
      <section className="hidden min-h-screen flex-col justify-between border-r border-surface-border bg-surface/70 px-10 py-8 lg:flex">
        <div className="space-y-12">
          <div>
            <p className="text-sm font-semibold tracking-normal text-brand">
              ArchFlow
            </p>
            <h1 className="mt-6 max-w-md text-4xl font-semibold leading-tight tracking-normal text-copy-primary">
              Design systems with a shared architecture canvas.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-copy-secondary">
              Sign in to manage projects, collaborate on diagrams, and turn
              architecture work into persistent specs.
            </p>
          </div>

          <ul className="space-y-3 text-sm text-copy-muted">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-brand"
                />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-copy-faint">
          © {new Date().getFullYear()} ArchFlow system design workspace
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        {children}
      </section>
    </main>
  );
}
