"use client";

import { useMemo, useState } from "react";

export interface MockProject {
  id: string;
  name: string;
  slug: string;
  ownerLabel: string;
  isOwned: boolean;
}

type DialogMode = "create" | "rename" | "delete";

interface DialogState {
  mode: DialogMode;
  project: MockProject | null;
}

const initialOwnedProjects: MockProject[] = [
  {
    id: "project-1",
    name: "Realtime Checkout",
    slug: "realtime-checkout",
    ownerLabel: "Owned by you",
    isOwned: true,
  },
  {
    id: "project-2",
    name: "Analytics Pipeline",
    slug: "analytics-pipeline",
    ownerLabel: "Owned by you",
    isOwned: true,
  },
];

const initialSharedProjects: MockProject[] = [
  {
    id: "project-3",
    name: "Support Automation",
    slug: "support-automation",
    ownerLabel: "Shared workspace",
    isOwned: false,
  },
];

function slugifyProjectName(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "untitled-project"
  );
}

export function useProjectDialogs() {
  const [ownedProjects, setOwnedProjects] =
    useState<MockProject[]>(initialOwnedProjects);
  const [sharedProjects] = useState<MockProject[]>(initialSharedProjects);
  const [dialogState, setDialogState] = useState<DialogState | null>(null);
  const [projectName, setProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const slugPreview = useMemo(
    () => slugifyProjectName(projectName),
    [projectName],
  );

  function openCreateDialog() {
    setProjectName("");
    setDialogState({ mode: "create", project: null });
  }

  function openRenameDialog(project: MockProject) {
    setProjectName(project.name);
    setDialogState({ mode: "rename", project });
  }

  function openDeleteDialog(project: MockProject) {
    setProjectName("");
    setDialogState({ mode: "delete", project });
  }

  function closeDialog() {
    if (isLoading) {
      return;
    }

    setDialogState(null);
    setProjectName("");
  }

  function createProject() {
    setIsLoading(true);
    const name = projectName.trim() || "Untitled Project";
    const slug = slugifyProjectName(name);

    setOwnedProjects((projects) => [
      {
        id: `project-${Date.now()}`,
        name,
        slug,
        ownerLabel: "Owned by you",
        isOwned: true,
      },
      ...projects,
    ]);
    setIsLoading(false);
    setDialogState(null);
    setProjectName("");
  }

  function renameProject() {
    if (!dialogState?.project) {
      return;
    }

    setIsLoading(true);
    const name = projectName.trim() || dialogState.project.name;
    const slug = slugifyProjectName(name);

    setOwnedProjects((projects) =>
      projects.map((project) =>
        project.id === dialogState.project?.id
          ? {
              ...project,
              name,
              slug,
            }
          : project,
      ),
    );
    setIsLoading(false);
    setDialogState(null);
    setProjectName("");
  }

  function deleteProject() {
    if (!dialogState?.project) {
      return;
    }

    setIsLoading(true);
    setOwnedProjects((projects) =>
      projects.filter((project) => project.id !== dialogState.project?.id),
    );
    setIsLoading(false);
    setDialogState(null);
  }

  return {
    ownedProjects,
    sharedProjects,
    dialogState,
    projectName,
    slugPreview,
    isLoading,
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
