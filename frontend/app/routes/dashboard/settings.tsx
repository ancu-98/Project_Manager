import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import UpdateWorkspace from "@/components/workspace/update-workspace";
import { useGetWorkspaceDetailsQuery } from "@/hooks/use-workspace";
import type { Workspace } from "@/types/app";
import { Settings } from "lucide-react";
import { useSearchParams } from "react-router";
import TransferWorkspaceOwner from "../../components/workspace/transfer-workspace-owner";
import DeleteWorkspace from "@/components/workspace/delete-workspace";

const WorkspaceSettings = () => {
  const [searchParams] = useSearchParams();

  const workspaceId = searchParams.get("workspaceId");

  const { data, isLoading } = useGetWorkspaceDetailsQuery(workspaceId!) as {
    data: Workspace;
    isLoading: boolean;
  };

  if (isLoading)
    return (
      <div>
        <Loader />
      </div>
    );

  if (!data || !workspaceId)
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon" className="w-16 h-16">
            <Settings className="w-8 h-8" />
          </EmptyMedia>
          <EmptyTitle>Select a Workspace</EmptyTitle>
          <EmptyDescription>
            Choose a workspace to edit it.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <BackButton />
        </EmptyContent>
      </Empty>
    );

  return (
    <div className="mx-auto py-2 px-2 sm:py-4 md:px-4 max-w-[640px]">
        <UpdateWorkspace key={data._id} workspace={data}/>

        <TransferWorkspaceOwner key={data._id} workspace={data}/>

        <DeleteWorkspace key={data._id} workspaceId={data._id}/>
    </div>
  );
};

export default WorkspaceSettings;
