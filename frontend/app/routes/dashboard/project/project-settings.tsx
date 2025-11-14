import { Loader } from "@/components/loader";
import DeleteProject from "@/components/project/delete-project";
import ProjectMembersList from "@/components/project/project-members";
import UpdateProject from "@/components/project/update-project";
import { useGetProjectBacklogDetailsQuery } from "@/hooks/use-project";
import type { Backlog, Project } from "@/types/app";
import { useParams } from "react-router";

const ProjectSettings = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const { data, isLoading } = useGetProjectBacklogDetailsQuery(projectId!) as {
    data: {
      project: Project;
      backlog: Backlog;
    };
    isLoading: boolean;
  };

  if (isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  const workspaceId = data.project.workspace.toString()

  return (
    <div className="mx-auto py-2 px-2 sm:py-4 md:px-4 max-w-[640px]">
      <UpdateProject key={data.project._id} project={data.project} />

      <ProjectMembersList
        key={data.project._id}
        projectMembers={data.project.members as any}
      />

      <DeleteProject key={data.project._id} project={data.project} workspaceId={workspaceId}/>
    </div>
  );
};

export default ProjectSettings;
