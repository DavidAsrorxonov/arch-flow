import { redirect } from "next/navigation";

import { AccessDenied } from "@/components/editor/access-denied";
import { EditorWorkspaceShell } from "@/components/editor/editor-workspace-shell";
import { getEditorProjectLists } from "@/lib/project-api";
import {
  getAccessibleProject,
  getCurrentClerkIdentity,
} from "@/lib/project-access";

interface EditorWorkspacePageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function EditorWorkspacePage({
  params,
}: EditorWorkspacePageProps) {
  const [{ roomId }, identity] = await Promise.all([
    params,
    getCurrentClerkIdentity(),
  ]);

  if (!identity) {
    redirect("/sign-in");
  }

  const project = await getAccessibleProject(roomId, identity);

  if (!project) {
    return <AccessDenied />;
  }

  const { ownedProjects, sharedProjects } = await getEditorProjectLists();

  return (
    <EditorWorkspaceShell
      project={project}
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
      canManageAccess={project.ownerId === identity.userId}
    />
  );
}
