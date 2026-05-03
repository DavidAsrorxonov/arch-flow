"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EditorHomeProps {
  onCreateProject: () => void;
}

export function EditorHome({ onCreateProject }: EditorHomeProps) {
  return (
    <div className="flex min-h-full items-center justify-center px-6 py-16">
      <div className="flex max-w-xl flex-col items-center text-center">
        <h1 className="text-2xl font-semibold leading-8 text-copy-primary md:text-3xl md:leading-10">
          Create a project or open an existing one
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-copy-muted">
          Start a new architecture workspace, or choose a project from the
          sidebar
        </p>
        <Button type="button" className="mt-8" onClick={onCreateProject}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Project
        </Button>
      </div>
    </div>
  );
}
