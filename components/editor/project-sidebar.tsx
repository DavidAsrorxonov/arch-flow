"use client";

import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

function EmptyProjectState() {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-border-subtle bg-subtle/40 px-6 text-center">
      <p className="text-sm font-medium text-copy-secondary">No projects yet</p>
      <p className="mt-2 text-sm leading-6 text-copy-muted">
        Project lists will appear here once project data is connected.
      </p>
    </div>
  );
}

export function ProjectSidebar({
  isOpen,
  onClose,
  className,
}: ProjectSidebarProps) {
  return (
    <aside
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={cn(
        "fixed left-4 top-18 bottom-4 z-40 flex w-88 max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-surface-border bg-surface/95 shadow-2xl transition duration-200 ease-out",
        isOpen
          ? "translate-x-0 opacity-100"
          : "pointer-events-none -translate-x-[calc(100%+1rem)] opacity-0",
        className,
      )}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-surface-border px-4">
        <h2 className="text-sm font-semibold text-copy-primary">Projects</h2>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close project sidebar"
          onClick={onClose}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <Tabs defaultValue="my-projects" className="min-h-0 flex-1 p-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>
        <TabsContent value="my-projects" className="mt-4">
          <EmptyProjectState />
        </TabsContent>
        <TabsContent value="shared" className="mt-4">
          <EmptyProjectState />
        </TabsContent>
      </Tabs>

      <div className="shrink-0 border-t border-surface-border p-4">
        <Button type="button" className="w-full">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Project
        </Button>
      </div>
    </aside>
  );
}
