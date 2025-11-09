import { Loader } from "@/components/loader";
import { NoDataFound } from "@/components/no-data-found";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WorkspaceAvatar } from "@/components/workspace/workspace-avatar";
import { useGetPublicWorkspaceProjectsQuery, useJoinRequestMutation } from "@/hooks/use-workspace";
import { getActivityStatusColor } from "@/lib/app";
import { cn } from "@/lib/utils";
import type { Project, User, Workspace } from "@/types/app.ts";
import { format } from "date-fns";
import { CalendarDays, Plus, UserPlus } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

const PublicWorkspaceDetails = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [isCreateProject, setIsCreateProject] = useState(false);
  const [isRequestToJoin, setIsRequestToJoin] = useState(false);

  if (!workspaceId) {
    return <div>No workspace found</div>;
  }

  const { data, isLoading } = useGetPublicWorkspaceProjectsQuery(
    workspaceId
  ) as {
    data: {
      workspace: Workspace;
      projects: Project[];
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

  return (
    <div className="py-4 px-2">
      {/*Worskpace Header*/}
      <PublicWorkspaceHeader
        workspace={data.workspace}
        members={data?.workspace?.members as any}
        onRequestToJoin={() => setIsRequestToJoin(false)}
      />

      <div>
        <h3 className="text-x1 font-medium mb-4">Projects</h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.projects.length === 0 ? (
            <NoDataFound
              title="No projects found"
              description="Create a project to get started"
              buttonText="Create Project"
              buttonAction={() => setIsCreateProject(false)}
            />
          ) : (
            data.projects.map((project) => {
              const projectProgress = 0;

              return (
                <PublicProjectCard
                  key={project._id}
                  project={project}
                  progress={projectProgress}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

interface PublicWorkspaceHeaderProps {
  workspace: Workspace;
  members: {
    _id: string;
    user: User;
    role: "admin" | "member" | "owner" | "viewer";
    joinedAt: Date;
  }[];
  onRequestToJoin: () => void;
}

const PublicWorkspaceHeader = ({
  workspace,
  members,
  onRequestToJoin,
}: PublicWorkspaceHeaderProps) => {

  const {mutate: joinRequestMutation, isPending} = useJoinRequestMutation();

  const navigate = useNavigate();

  const handleJoinRequest = (workspaceId: string) => {
    joinRequestMutation(workspaceId, {
      onSuccess: () => {
          toast.success("Join Request sent succesfully");
          navigate(`/workspaces/explore-workspaces`);
        },
        onError: (error: any) => {
          toast.error(error.response.data.message);
          console.log(error);
        },
    })
  }


  return (
    <div className="'space-y-8">
      <div className="space-y-3">
        <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-center gap-3">
          <div className="flex md:items-center gap-3">
            {workspace.color && (
              <WorkspaceAvatar color={workspace.color} name={workspace.name} />
            )}

            <h2 className="font-semibold text-x1 md:text-2x1">
              {workspace.name}
            </h2>
          </div>

          <div className="flex items-center gap-3 justify-between md:justify-start mb-4 md:mb-0 border-amber-200">
            <Button
              variant={"outline"}
              onClick={() => handleJoinRequest(workspace._id)}
              disabled={isPending}
            >
              <UserPlus className="size-4 mr-2" />
              {isPending ? "Sending..." : "Request to Join"}
            </Button>
          </div>
        </div>

        {workspace.description && (
          <p className="text-sm md:text-base text-muted-foreground">
            {workspace.description}
          </p>
        )}
      </div>

      {members.length > 0 && (
        <div className="flex items-center gap-2 mt-4">
          <span className="text-sm text-muted-foreground">Members</span>

          <div className="flex space-x-2">
            {members.map((member) => (
              <Avatar
                key={member._id}
                className="relative h-8 w-8 rounded-full border-2 border-background overflow-hidden"
                title={member.user.name}
              >
                <AvatarImage
                  src={member.user.profilePicture}
                  alt={member.user.name}
                />
                <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface PublicProjectCardProps {
  project: Project;
  progress: number;
}

export const PublicProjectCard = ({
  project,
  progress,
}: PublicProjectCardProps) => {
  return (
    <Card className="transition-all duration-300 hover:shadow-md hover:translate-y-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{project.title}</CardTitle>
          <Badge
            className={cn(
              "text-xs rounded-full",
              getActivityStatusColor(project.status)
            )}
          >
            {project.status}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {project.description || "No description"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="flex justify-between text-xs">
              <span>Progress</span>
              <span>{progress}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex items-center gap-2">
            {project.tags.map((tag) => (
              <Badge>{tag}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PublicWorkspaceDetails;
