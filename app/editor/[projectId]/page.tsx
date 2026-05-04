import { EditorShell } from "@/components/editor/editor-shell";
import { getEditorProjectLists } from "@/lib/project-api";

interface EditorWorkspacePageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function EditorWorkspacePage({
  params,
}: EditorWorkspacePageProps) {
  const [{ projectId }, { ownedProjects, sharedProjects }] = await Promise.all([
    params,
    getEditorProjectLists(),
  ]);

  return (
    <EditorShell
      activeProjectId={projectId}
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
    />
  );
}
