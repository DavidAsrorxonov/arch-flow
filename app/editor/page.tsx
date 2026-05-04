import { EditorShell } from "@/components/editor/editor-shell";
import { getEditorProjectLists } from "@/lib/project-api";

export default async function EditorPage() {
  const { ownedProjects, sharedProjects } = await getEditorProjectLists();

  return (
    <EditorShell
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
    />
  );
}
