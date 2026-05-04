"use client";

import { Copy, Loader2, Plus, Trash2, UserRound } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type {
  CollaboratorListItem,
  CollaboratorListResponse,
} from "@/types/collaborators";

interface ShareDialogProps {
  projectId: string;
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCanManageAccess: boolean;
}

function getInitials(collaborator: CollaboratorListItem) {
  const source = collaborator.displayName ?? collaborator.email;

  return source.trim().slice(0, 1).toUpperCase();
}

async function readApiError(response: Response) {
  const payload: unknown = await response.json().catch(() => null);

  if (
    payload &&
    typeof payload === "object" &&
    typeof (payload as { error?: unknown }).error === "string"
  ) {
    return (payload as { error: string }).error;
  }

  return "Share request failed.";
}

function isCollaboratorListResponse(
  value: unknown,
): value is CollaboratorListResponse {
  if (
    !value ||
    typeof value !== "object" ||
    !Array.isArray((value as { collaborators?: unknown }).collaborators)
  ) {
    return false;
  }

  return (
    typeof (value as { canManageAccess?: unknown }).canManageAccess ===
    "boolean"
  );
}

export function ShareDialog({
  projectId,
  projectName,
  open,
  onOpenChange,
  initialCanManageAccess,
}: ShareDialogProps) {
  const [collaborators, setCollaborators] = useState<CollaboratorListItem[]>(
    [],
  );
  const [canManageAccess, setCanManageAccess] = useState(
    initialCanManageAccess,
  );
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingCollaboratorId, setRemovingCollaboratorId] = useState<
    string | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const projectLink = useMemo(() => {
    const projectPath = `/editor/${encodeURIComponent(projectId)}`;

    if (typeof window === "undefined") {
      return projectPath;
    }

    return `${window.location.origin}${projectPath}`;
  }, [projectId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const controller = new AbortController();

    async function loadCollaborators() {
      setError(null);
      setCopied(false);
      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/projects/${encodeURIComponent(projectId)}/collaborators`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          setError(await readApiError(response));
          return;
        }

        const payload: unknown = await response.json();

        if (!isCollaboratorListResponse(payload)) {
          setError("Collaborator response was invalid.");
          return;
        }

        setCollaborators(payload.collaborators);
        setCanManageAccess(payload.canManageAccess);
      } catch (loadError) {
        if ((loadError as { name?: string }).name !== "AbortError") {
          setError("Unable to load collaborators.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    void loadCollaborators();

    return () => controller.abort();
  }, [open, projectId]);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  async function inviteCollaborator(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canManageAccess || !email.trim()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(projectId)}/collaborators`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      if (!response.ok) {
        setError(await readApiError(response));
        return;
      }

      setEmail("");

      const listResponse = await fetch(
        `/api/projects/${encodeURIComponent(projectId)}/collaborators`,
      );

      if (listResponse.ok) {
        const payload: unknown = await listResponse.json();

        if (isCollaboratorListResponse(payload)) {
          setCollaborators(payload.collaborators);
          setCanManageAccess(payload.canManageAccess);
        }
      }
    } catch (error) {
      setError("Unable to invite collaborator.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function removeCollaborator(collaboratorId: string) {
    if (!canManageAccess) {
      return;
    }

    setRemovingCollaboratorId(collaboratorId);
    setError(null);

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(
          projectId,
        )}/collaborators/${encodeURIComponent(collaboratorId)}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        setError(await readApiError(response));
        return;
      }

      setCollaborators((currentCollaborators) =>
        currentCollaborators.filter(
          (collaborator) => collaborator.id !== collaboratorId,
        ),
      );
    } finally {
      setRemovingCollaboratorId(null);
    }
  }

  async function copyProjectLink() {
    if (!canManageAccess || !projectLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(projectLink);
      setCopied(true);
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }

      copiedTimeoutRef.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Failed to copy link to clipboard.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border-surface-border bg-elevated p-6 text-copy-primary sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg leading-7">Share Project</DialogTitle>
          <DialogDescription className="text-copy-muted">
            {projectName}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {canManageAccess ? (
            <div className="space-y-3">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-copy-secondary">
                  Project link
                </span>
                <div className="flex gap-2">
                  <Input
                    value={projectLink}
                    readOnly
                    className="font-mono text-xs text-copy-primary"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={copyProjectLink}
                    disabled={!projectLink}
                  >
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </label>

              <form className="flex gap-2" onSubmit={inviteCollaborator}>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="collaborator@example.com"
                  disabled={isSubmitting}
                  className="text-copy-primary"
                  aria-label="Collaborator email"
                />
                <Button type="submit" disabled={isSubmitting || !email.trim()}>
                  {isSubmitting ? (
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  )}
                  Invite
                </Button>
              </form>
            </div>
          ) : null}

          {error ? (
            <p className="text-sm leading-5 text-destructive">{error}</p>
          ) : null}

          <div>
            <h3 className="text-sm font-semibold text-copy-primary">
              Collaborators
            </h3>

            <div className="mt-3 space-y-2">
              {isLoading ? (
                <div className="flex items-center gap-2 rounded-2xl border border-surface-border bg-subtle px-3 py-3 text-sm text-copy-muted">
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Loading collaborators
                </div>
              ) : collaborators.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border-subtle bg-subtle/40 px-4 py-6 text-center text-sm text-copy-muted">
                  No collaborators yet
                </div>
              ) : (
                collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center gap-3 rounded-2xl border border-surface-border bg-subtle/60 px-3 py-2"
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-surface-border bg-elevated text-sm font-semibold text-copy-secondary"
                      style={
                        collaborator.avatarUrl
                          ? {
                              backgroundImage: `url("${collaborator.avatarUrl}")`,
                              backgroundPosition: "center",
                              backgroundSize: "cover",
                            }
                          : undefined
                      }
                    >
                      {collaborator.avatarUrl ? (
                        <span className="sr-only">
                          {collaborator.displayName ?? collaborator.email}
                        </span>
                      ) : collaborator.displayName ? (
                        getInitials(collaborator)
                      ) : (
                        <UserRound className="h-4 w-4" aria-hidden="true" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-copy-primary">
                        {collaborator.displayName ?? collaborator.email}
                      </p>
                      {collaborator.displayName ? (
                        <p className="truncate text-xs text-copy-muted">
                          {collaborator.email}
                        </p>
                      ) : null}
                    </div>

                    {canManageAccess ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove ${collaborator.email}`}
                        disabled={removingCollaboratorId === collaborator.id}
                        onClick={() => void removeCollaborator(collaborator.id)}
                      >
                        {removingCollaboratorId === collaborator.id ? (
                          <Loader2
                            className="h-4 w-4 animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        )}
                      </Button>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 border-surface-border bg-transparent p-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
