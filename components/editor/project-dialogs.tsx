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
import type { useProjectActions } from "@/hooks/use-project-actions";

interface ProjectDialogsProps {
  actions: ReturnType<typeof useProjectActions>;
}

export function ProjectDialogs({ actions }: ProjectDialogsProps) {
  const {
    dialogState,
    projectName,
    roomIdPreview,
    projectNameError,
    canSubmitProjectForm,
    isLoading,
    formError,
    setProjectName,
    closeDialog,
    createProject,
    renameProject,
    deleteProject,
  } = actions;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (dialogState?.mode === "create") {
      void createProject();
      return;
    }

    if (dialogState?.mode === "rename") {
      void renameProject();
      return;
    }

    if (dialogState?.mode === "delete") {
      void deleteProject();
    }
  }

  const isCreateOpen = dialogState?.mode === "create";
  const isRenameOpen = dialogState?.mode === "rename";
  const isDeleteOpen = dialogState?.mode === "delete";

  return (
    <>
      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
      >
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
                  className="mt-2 text-copy-primary"
                  aria-invalid={Boolean(projectNameError)}
                  aria-describedby={
                    projectNameError ? "create-project-name-error" : undefined
                  }
                />
                {projectNameError ? (
                  <span
                    id="create-project-name-error"
                    className="block text-sm leading-5 text-destructive"
                  >
                    {projectNameError}
                  </span>
                ) : null}
              </label>
              <div className="rounded-xl border border-surface-border bg-subtle px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-normal text-copy-faint">
                  Room ID preview
                </p>
                <p
                  className={
                    roomIdPreview
                      ? "mt-1 font-mono text-sm text-brand"
                      : "mt-1 font-mono text-sm text-copy-muted"
                  }
                >
                  {roomIdPreview || "No room ID available"}
                </p>
              </div>
              {formError ? (
                <p className="text-sm leading-5 text-destructive">
                  {formError}
                </p>
              ) : null}
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
                <Button
                  type="submit"
                  disabled={isLoading || !canSubmitProjectForm}
                >
                  Create
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isRenameOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
      >
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
                  className="mt-2 text-copy-primary"
                  aria-invalid={Boolean(projectNameError)}
                  aria-describedby={
                    projectNameError ? "rename-project-name-error" : undefined
                  }
                />
                {projectNameError ? (
                  <span
                    id="rename-project-name-error"
                    className="block text-sm leading-5 text-destructive"
                  >
                    {projectNameError}
                  </span>
                ) : null}
                {formError ? (
                  <span className="block text-sm leading-5 text-destructive">
                    {formError}
                  </span>
                ) : null}
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
                <Button
                  type="submit"
                  disabled={isLoading || !canSubmitProjectForm}
                >
                  Rename
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
      >
        <DialogContent className="rounded-3xl border-surface-border bg-elevated p-6 text-copy-primary sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-lg leading-7">
                Delete Project
              </DialogTitle>
              <DialogDescription className="text-copy-muted">
                Delete {dialogState?.project?.name}? This removes the project
                and its collaborator access.
              </DialogDescription>
            </DialogHeader>
            {formError ? (
              <p className="mt-6 text-sm leading-5 text-destructive">
                {formError}
              </p>
            ) : null}

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
