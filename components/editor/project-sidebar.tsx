"use client";

import { Pencil, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { ProjectListItem } from "@/types/projects";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeProjectId?: string;
  ownedProjects: ProjectListItem[];
  sharedProjects: ProjectListItem[];
  onCreateProject: () => void;
  onRenameProject: (project: ProjectListItem) => void;
  onDeleteProject: (project: ProjectListItem) => void;
  className?: string;
}

interface ProjectListProps {
  projects: ProjectListItem[];
  emptyDescription: string;
  activeProjectId?: string;
  onSelectProject: () => void;
  onRenameProject: (project: ProjectListItem) => void;
  onDeleteProject: (project: ProjectListItem) => void;
}

function EmptyProjectState({ description }: { description: string }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-border-subtle bg-subtle/40 px-6 text-center">
      <p className="text-sm font-medium text-copy-secondary">No projects yet</p>
      <p className="mt-2 text-sm leading-6 text-copy-muted">{description}</p>
    </div>
  );
}

function ProjectList({
  projects,
  emptyDescription,
  activeProjectId,
  onSelectProject,
  onRenameProject,
  onDeleteProject,
}: ProjectListProps) {
  if (projects.length === 0) {
    return <EmptyProjectState description={emptyDescription} />;
  }

  return (
    <div className="space-y-2">
      {projects.map((project) => (
        <div
          key={project.id}
          className={cn(
            "group flex min-h-16 items-center gap-3 rounded-2xl border bg-subtle/60 px-3 py-2 transition-colors",
            project.id === activeProjectId
              ? "border-brand bg-accent-dim"
              : "border-surface-border hover:border-border-subtle",
          )}
        >
          <Link
            href={`/editor/${encodeURIComponent(project.id)}`}
            className="min-w-0 flex-1 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
            aria-current={project.id === activeProjectId ? "page" : undefined}
            onClick={onSelectProject}
          >
            <p className="truncate text-sm font-medium text-copy-primary">
              {project.name}
            </p>
            <p className="mt-1 truncate font-mono text-xs text-copy-muted">
              {project.slug}
            </p>
            <p className="mt-1 text-xs text-copy-faint">{project.ownerLabel}</p>
          </Link>

          {project.isOwned ? (
            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Rename ${project.name}`}
                onClick={() => onRenameProject(project)}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${project.name}`}
                onClick={() => onDeleteProject(project)}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function ProjectSidebar({
  isOpen,
  onClose,
  activeProjectId,
  ownedProjects,
  sharedProjects,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  className,
}: ProjectSidebarProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Close project sidebar"
        className={cn(
          "fixed inset-0 z-30 bg-base/70 backdrop-blur-sm transition-opacity md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />

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
            <ProjectList
              projects={ownedProjects}
              emptyDescription="Create a project to start building architecture workspaces."
              activeProjectId={activeProjectId}
              onSelectProject={onClose}
              onRenameProject={onRenameProject}
              onDeleteProject={onDeleteProject}
            />
          </TabsContent>
          <TabsContent value="shared" className="mt-4">
            <ProjectList
              projects={sharedProjects}
              emptyDescription="Shared collaborator projects will appear here."
              activeProjectId={activeProjectId}
              onSelectProject={onClose}
              onRenameProject={onRenameProject}
              onDeleteProject={onDeleteProject}
            />
          </TabsContent>
        </Tabs>

        <div className="shrink-0 border-t border-surface-border p-4">
          <Button type="button" className="w-full" onClick={onCreateProject}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}
