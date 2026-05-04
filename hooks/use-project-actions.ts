"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { ProjectListItem } from "@/types/projects";

type DialogMode = "create" | "rename" | "delete";

interface DialogState {
  mode: DialogMode;
  project: ProjectListItem | null;
}

interface UseProjectActionsOptions {
  activeProjectId?: string;
}

interface ProjectResponse {
  project: {
    id: string;
    name: string;
  };
}

function slugifyProjectName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateShortSuffix() {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);

    return values[0].toString(36).slice(0, 6).padStart(6, "0");
  }

  return Math.random().toString(36).slice(2, 8).padEnd(6, "0");
}

function getProjectNameError(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "Enter a project name.";
  }

  if (!slugifyProjectName(trimmedValue)) {
    return "Use at least one letter or number so a project slug can be generated.";
  }

  return null;
}

function isProjectResponse(value: unknown): value is ProjectResponse {
  if (!value || typeof value !== "object" || !("project" in value)) {
    return false;
  }

  const project = (value as { project: unknown }).project;

  return (
    Boolean(project) &&
    typeof project === "object" &&
    typeof (project as { id?: unknown }).id === "string" &&
    typeof (project as { name?: unknown }).name === "string"
  );
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

  return "Project request failed.";
}

export function useProjectActions({
  activeProjectId,
}: UseProjectActionsOptions = {}) {
  const router = useRouter();
  const [dialogState, setDialogState] = useState<DialogState | null>(null);
  const [projectName, setProjectName] = useState("");
  const [createSuffix, setCreateSuffix] = useState(generateShortSuffix);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubmittedProjectForm, setHasSubmittedProjectForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const slugPreview = useMemo(
    () => slugifyProjectName(projectName),
    [projectName],
  );
  const roomIdPreview = useMemo(
    () => (slugPreview ? `${slugPreview}-${createSuffix}` : ""),
    [createSuffix, slugPreview],
  );
  const projectNameError = useMemo(
    () => getProjectNameError(projectName),
    [projectName],
  );
  const shouldShowProjectNameError =
    hasSubmittedProjectForm ||
    (projectName.length > 0 && Boolean(projectNameError));
  const visibleProjectNameError = shouldShowProjectNameError
    ? projectNameError
    : null;

  function openCreateDialog() {
    setCreateSuffix(generateShortSuffix());
    setProjectName("");
    setFormError(null);
    setHasSubmittedProjectForm(false);
    setDialogState({ mode: "create", project: null });
  }

  function openRenameDialog(project: ProjectListItem) {
    setProjectName(project.name);
    setFormError(null);
    setHasSubmittedProjectForm(false);
    setDialogState({ mode: "rename", project });
  }

  function openDeleteDialog(project: ProjectListItem) {
    setProjectName("");
    setFormError(null);
    setHasSubmittedProjectForm(false);
    setDialogState({ mode: "delete", project });
  }

  function closeDialog() {
    if (isLoading) {
      return;
    }

    setDialogState(null);
    setProjectName("");
    setFormError(null);
    setHasSubmittedProjectForm(false);
  }

  async function createProject() {
    setHasSubmittedProjectForm(true);
    setFormError(null);

    if (projectNameError || !roomIdPreview) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: roomIdPreview,
          name: projectName.trim(),
        }),
      });

      if (!response.ok) {
        setFormError(await readApiError(response));
        return;
      }

      const payload: unknown = await response.json();

      if (!isProjectResponse(payload)) {
        setFormError("Project response was invalid.");
        return;
      }

      setDialogState(null);
      setProjectName("");
      setHasSubmittedProjectForm(false);
      router.push(`/editor/${encodeURIComponent(payload.project.id)}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function renameProject() {
    if (!dialogState?.project) {
      return;
    }

    setHasSubmittedProjectForm(true);
    setFormError(null);

    if (projectNameError) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/projects/${dialogState.project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName.trim() }),
      });

      if (!response.ok) {
        setFormError(await readApiError(response));
        return;
      }

      setDialogState(null);
      setProjectName("");
      setHasSubmittedProjectForm(false);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteProject() {
    if (!dialogState?.project) {
      return;
    }

    const projectId = dialogState.project.id;

    setFormError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setFormError(await readApiError(response));
        return;
      }

      setDialogState(null);
      setHasSubmittedProjectForm(false);

      if (activeProjectId === projectId) {
        router.replace("/editor");
        return;
      }

      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return {
    dialogState,
    projectName,
    slugPreview,
    roomIdPreview,
    projectNameError: visibleProjectNameError,
    canSubmitProjectForm: !projectNameError,
    isLoading,
    formError,
    setProjectName,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    createProject,
    renameProject,
    deleteProject,
  };
}
