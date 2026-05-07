"use client";

import {
  CheckCircle2,
  LayoutTemplate,
  LoaderCircle,
  PanelRightClose,
  PanelRightOpen,
  Save,
  Share2,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";

import { AiSidebar } from "@/components/editor/ai-sidebar";
import { CollaborativeCanvas } from "@/components/editor/collaborative-canvas";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { ShareDialog } from "@/components/editor/share-dialog";
import { Button } from "@/components/ui/button";
import type { CanvasSaveStatus } from "@/hooks/use-canvas-autosave";
import { useProjectActions } from "@/hooks/use-project-actions";
import type { AccessibleProject } from "@/lib/project-access";
import type { ProjectListItem } from "@/types/projects";

interface EditorWorkspaceShellProps {
  project: AccessibleProject;
  ownedProjects: ProjectListItem[];
  sharedProjects: ProjectListItem[];
  canManageAccess: boolean;
}

export function EditorWorkspaceShell({
  project,
  ownedProjects,
  sharedProjects,
  canManageAccess,
}: EditorWorkspaceShellProps) {
  const [isProjectSidebarOpen, setIsProjectSidebarOpen] = useState(false);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isStarterTemplatesOpen, setIsStarterTemplatesOpen] = useState(false);
  const [canvasSaveStatus, setCanvasSaveStatus] =
    useState<CanvasSaveStatus>("saved");
  const projectActions = useProjectActions({ activeProjectId: project.id });
  const AiSidebarIcon = isAiSidebarOpen ? PanelRightClose : PanelRightOpen;

  return (
    <div className="flex min-h-screen flex-col bg-base text-copy-primary">
      <EditorNavbar
        projectName={project.name}
        isSidebarOpen={isProjectSidebarOpen}
        onToggleSidebar={() => setIsProjectSidebarOpen((isOpen) => !isOpen)}
        showUserButton={false}
        rightActions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={`Canvas ${getSaveStatusLabel(canvasSaveStatus).toLowerCase()}`}
              disabled
            >
              {renderSaveStatusIcon(canvasSaveStatus)}
              {getSaveStatusLabel(canvasSaveStatus)}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Import starter template"
              onClick={() => setIsStarterTemplatesOpen(true)}
            >
              <LayoutTemplate className="h-4 w-4" aria-hidden="true" />
              Templates
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Share project"
              onClick={() => setIsShareDialogOpen(true)}
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
              Share
            </Button>
            <Button
              type="button"
              variant={isAiSidebarOpen ? "secondary" : "ghost"}
              size="icon"
              aria-label={
                isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"
              }
              aria-pressed={isAiSidebarOpen}
              onClick={() => setIsAiSidebarOpen((isOpen) => !isOpen)}
            >
              <AiSidebarIcon className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        }
      />

      <ProjectSidebar
        isOpen={isProjectSidebarOpen}
        onClose={() => setIsProjectSidebarOpen(false)}
        activeProjectId={project.id}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        onCreateProject={projectActions.openCreateDialog}
        onRenameProject={projectActions.openRenameDialog}
        onDeleteProject={projectActions.openDeleteDialog}
      />

      <main className="min-h-0 flex-1 overflow-hidden bg-base">
        <div className="flex h-[calc(100vh-3.5rem)] min-h-0">
          <section className="relative min-w-0 flex-1 overflow-hidden bg-base">
            <CollaborativeCanvas
              roomId={project.id}
              isStarterTemplatesOpen={isStarterTemplatesOpen}
              onSaveStatusChange={setCanvasSaveStatus}
              onStarterTemplatesOpenChange={setIsStarterTemplatesOpen}
            />
            <AiSidebar
              isOpen={isAiSidebarOpen}
              onClose={() => setIsAiSidebarOpen(false)}
            />
          </section>
        </div>
      </main>

      <ProjectDialogs actions={projectActions} />
      <ShareDialog
        projectId={project.id}
        projectName={project.name}
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        initialCanManageAccess={canManageAccess}
      />
    </div>
  );
}

function getSaveStatusLabel(status: CanvasSaveStatus) {
  if (status === "saving") {
    return "Saving";
  }

  if (status === "error") {
    return "Save error";
  }

  return "Saved";
}

function renderSaveStatusIcon(status: CanvasSaveStatus) {
  if (status === "saving") {
    return (
      <LoaderCircle
        className={getSaveStatusIconClassName(status)}
        aria-hidden="true"
      />
    );
  }

  if (status === "error") {
    return (
      <TriangleAlert
        className={getSaveStatusIconClassName(status)}
        aria-hidden="true"
      />
    );
  }

  if (status === "saved") {
    return (
      <CheckCircle2
        className={getSaveStatusIconClassName(status)}
        aria-hidden="true"
      />
    );
  }

  return (
    <Save className={getSaveStatusIconClassName(status)} aria-hidden="true" />
  );
}

function getSaveStatusIconClassName(status: CanvasSaveStatus) {
  if (status === "saving") {
    return "h-4 w-4 animate-spin text-brand";
  }

  if (status === "error") {
    return "h-4 w-4 text-destructive";
  }

  return "h-4 w-4 text-success";
}
