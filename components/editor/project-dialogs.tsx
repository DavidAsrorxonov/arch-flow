"use client";

import type { FormEvent } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { useProjectDialogs } from "@/hooks/use-project-dialogs";

interface ProjectDialogsProps {
  dialogs: ReturnType<typeof useProjectDialogs>;
}

export function ProjectDialogs({ dialogs }: ProjectDialogsProps) {
  const {
    dialogState,
    projectName,
    slugPreview,
    isLoading,
    setProjectName,
    closeDialog,
    createProject,
    renameProject,
    deleteProject,
  } = dialogs;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (dialogState?.mode === "create") {
      createProject();
      return;
    }

    if (dialogState?.mode === "rename") {
      renameProject();
      return;
    }

    if (dialogState?.mode === "delete") {
      deleteProject();
    }
  }

  const isCreateOpen = dialogState?.mode === "create";
  const isRenameOpen = dialogState?.mode === "rename";
  const isDeleteOpen = dialogState?.mode === "delete";

  return (
    <>
      <Dialog open={isCreateOpen} onOpenChange={closeDialog}>
        <DialogContent className="rounded-3xl border-surface-border bg-elevated p-6 text-copy-primary sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-lg leading-7">
                Create Project
              </DialogTitle>
              <DialogDescription className="text-copy-muted">
                Name the architecture workspace before opening the canvas.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-copy-secondary mb-4">
                  Project name
                </span>
                <Input
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  placeholder="Realtime checkout"
                  disabled={isLoading}
                  className="text-white mt-2"
                />
              </label>
              <div className="rounded-xl border border-surface-border bg-subtle px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-normal text-copy-faint">
                  Slug preview
                </p>
                <p className="mt-1 font-mono text-sm text-brand">
                  {slugPreview}
                </p>
              </div>
            </div>

            <DialogFooter className="mt-6 border-surface-border bg-transparent p-0">
              <div className="flex gap-4 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDialog}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  Create
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRenameOpen} onOpenChange={closeDialog}>
        <DialogContent className="rounded-3xl border-surface-border bg-elevated p-6 text-copy-primary sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-lg leading-7">
                Rename Project
              </DialogTitle>
              <DialogDescription className="text-copy-muted">
                Current project: {dialogState?.project?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-copy-secondary">
                  Project name
                </span>
                <Input
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  disabled={isLoading}
                  autoFocus
                  className="text-white mt-2"
                />
              </label>
            </div>

            <DialogFooter className="mt-6 border-surface-border bg-transparent p-0">
              <div className="flex gap-4 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDialog}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  Rename
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={closeDialog}>
        <DialogContent className="rounded-3xl border-surface-border bg-elevated p-6 text-copy-primary sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-lg leading-7">
                Delete Project
              </DialogTitle>
              <DialogDescription className="text-copy-muted">
                Delete {dialogState?.project?.name}? This removes the project
                from the mock list for this session.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-6 border-surface-border bg-transparent p-0">
              <div className="flex gap-4 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDialog}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isLoading}
                >
                  Delete
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
