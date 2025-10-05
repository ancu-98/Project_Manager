import { Loader } from "@/components/loader";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { useGetWorkspaceQuery } from "@/hooks/use-workspace";
import type { Project, Workspace } from "@/types/app.ts";
import { useState } from "react";
import { useParams } from "react-router";


const WorkspaceDetails = () => {

    const { workspaceId } = useParams<{ workspaceId: string }>();
    const [isCreateProject, setIsCreateProject] = useState(false);
    const [isInviteMember, setIsInviteMember] = useState(false);

    if (!workspaceId) {
        return <div>No workspace found</div>
    }

    const {data, isLoading } = useGetWorkspaceQuery(workspaceId) as {
      data: {
        workspace: Workspace;
        projects: Project[];
      };
      isLoading: boolean;
    };

    if (isLoading) {
      return(
        <div>
          <Loader/>
        </div>
      );
    }

    if (!data || !data.workspace) {
      return <div>Workspace not found</div>;
    }

  return (
    <div>
      <WorkspaceHeader
        workspace={data.workspace}
        members={data?.workspace?.members as any}
        onCreateProject={() => setIsCreateProject(true)}
        onInviteMember={() => setIsInviteMember(true)}
      />
    </div>
  )
}

export default WorkspaceDetails