"use client";

import { Bot, PanelRightClose, PanelRightOpen, Share2 } from "lucide-react";
import { useState } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { ShareDialog } from "@/components/editor/share-dialog";
import { Button } from "@/components/ui/button";
import { useProjectActions } from "@/hooks/use-project-actions";
import { cn } from "@/lib/utils";
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
  const projectActions = useProjectActions({ activeProjectId: project.id });
  const AiSidebarIcon = isAiSidebarOpen ? PanelRightClose : PanelRightOpen;

  return (
    <div className="flex min-h-screen flex-col bg-base text-copy-primary">
      <EditorNavbar
        projectName={project.name}
        isSidebarOpen={isProjectSidebarOpen}
        onToggleSidebar={() => setIsProjectSidebarOpen((isOpen) => !isOpen)}
        rightActions={
          <div className="flex items-center gap-2">
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
          <section className="flex min-w-0 flex-1 items-center justify-center bg-base px-6">
            <div className="text-center">
              <p className="text-sm font-medium text-copy-secondary">
                Canvas workspace placeholder
              </p>
              <p className="mt-2 font-mono text-xs text-copy-faint">
                {project.id}
              </p>
            </div>
          </section>

          <aside
            className={cn(
              "min-h-0 w-80 max-w-[85vw] shrink-0 border-l border-surface-border bg-surface transition-[width,opacity] duration-200",
              isAiSidebarOpen
                ? "opacity-100"
                : "w-0 overflow-hidden border-l-0 opacity-0",
            )}
            aria-hidden={!isAiSidebarOpen}
          >
            <div className="flex h-full flex-col">
              <div className="flex h-14 shrink-0 items-center gap-2 border-b border-surface-border px-4">
                <Bot className="h-4 w-4 text-ai-text" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-copy-primary">
                  AI Assistant
                </h2>
              </div>
              <div className="flex flex-1 items-center justify-center px-6 text-center">
                <p className="text-sm leading-6 text-copy-muted">
                  AI chat placeholder
                </p>
              </div>
            </div>
          </aside>
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
