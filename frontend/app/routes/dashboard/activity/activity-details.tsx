import { ActivityAssigneesSelector } from "@/components/activity/activity-assignees-selector";
import { ActivityDescription } from "@/components/activity/activity-description";
import { ActivityHistory } from "@/components/activity/activity-history";
import { ActivityPrioritySelector } from "@/components/activity/activity-priority-selector";
import { ActivityStatusSelector } from "@/components/activity/activity-status-selector";
import { ActivityTitle } from "@/components/activity/activity-title";
import { CommentSection } from "@/components/activity/comment-section";
import { SubTasksDetails } from "@/components/activity/sub-tasks";
import { Watchers } from "@/components/activity/watchers";
import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useAchievedActivityMutation,
  useGetActivityByIdQuery,
  useWatchActivityMutation,
} from "@/hooks/use-activity";
import { useAuth } from "@/provider/auth.context";
import type { Activity, Backlog, Project } from "@/types/app";
import { formatDistanceToNow } from "date-fns";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

const ActivityDetails = () => {
  const { user } = useAuth();
  const { activityId, projectId, workspaceId } = useParams<{
    activityId: string;
    projectId: string;
    workspaceId: string;
  }>();

  const navigate = useNavigate();

  const { data, isLoading } = useGetActivityByIdQuery(activityId!) as {
    data: {
      activity: Activity;
      backlog: Backlog;
      project: Project;
    };
    isLoading: boolean;
  };

  const { mutate: watchActivity, isPending: isWatching } =
    useWatchActivityMutation();
  const { mutate: achievedActivity, isPending: isAchieved } =
    useAchievedActivityMutation();


    if (isLoading) {
      return (
        <div>
        <Loader />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-bold">Activity not found</div>
      </div>
    );
  }

  const { activity, backlog, project } = data;

  const isUserWatching = activity?.watchers?.some(
    (watcher) => watcher._id.toString() === user?._id.toString()
  );

  const handleWatchActivity = () => {
    watchActivity(
      { activityId: activity._id },
      {
        onSuccess: () => {
          toast.success("Activity watched");
        },
        onError: (error: any) => {
          toast.error("Failed to watch activity");
          const errMessage = error.response.data.message;
          console.log(error);
          toast.error(errMessage);
        },
      }
    );
  };

  const handleAchievedActivity = () => {
    achievedActivity(
      { activityId: activity._id},
      {
        onSuccess: () => {
          toast.success("Activity achieved");
        },
        onError: (error: any) => {
          toast.error("Failed to achieve activity");
          const errMessage = error.response.data.message;
          console.log(error);
          toast.error(errMessage);
        },
      }
    )
  }

  return (
    <div className="container mx-auto p-0 py-4 md:px-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div className="flex flex-col md:flex-row md:items-center">
          <BackButton />

          <h1 className="text-xl md:text-2xl font-bold ml-4">{activity.title}</h1>

          {activity.isArchived && (
            <Badge className="ml-2" variant={"outline"}>
              Archived
            </Badge>
          )}
        </div>

        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button
            variant={"outline"}
            size="sm"
            onClick={handleWatchActivity}
            className="w-fit"
            disabled={isWatching}
          >
            {isUserWatching ? (
              <>
                <EyeOff className="mr-2 size-4" />
                Unwatch
              </>
            ) : (
              <>
                <Eye className="mr-2 size-4" />
                Watch
              </>
            )}
          </Button>

          <Button
            variant={"outline"}
            size="sm"
            onClick={handleAchievedActivity}
            className="w-fit"
            disabled={isAchieved}
          >
            {activity.isArchived ? "Unarchive" : "Archive"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:col-span-2">
          <div className="min-w-160 bg-card rounded-lg p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start mb-4">
              <div>
                <Badge
                  variant={
                    activity.priority === "High"
                      ? "destructive"
                      : activity.priority === "Medium"
                        ? "default"
                        : "outline"
                  }
                  className="mb-2 capitalize"
                >
                  {activity.priority} Priority
                </Badge>

                <ActivityTitle
                  title={activity.title}
                  activityId={activity._id}
                />

                <div className="text-sm md:text-base text-muted-foreground">
                  Created at:{" "}
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <ActivityStatusSelector
                  status={activity.status}
                  activityId={activity._id}
                />

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {}}
                  className="hidden md:block"
                >
                  Delete Task
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-0">
                Description
              </h3>

              <ActivityDescription
                description={activity.description || ""}
                activityId={activity._id}
              />
            </div>

            <ActivityAssigneesSelector
              activity={activity}
              assignees={activity.assignees}
              projectMembers={project.members as any}
            />

            <ActivityPrioritySelector
              priority={activity.priority}
              activityId={activity._id}
            />

            <SubTasksDetails
              subTasks={activity.subtasks || []}
              activityId={activity._id}
            />
          </div>

          <CommentSection
            activityId={activity._id}
            members={project.members as any}
          />
        </div>

        {/* right side */}
        <div className="w-full">
          <Watchers watchers={activity.watchers || []} />

          <ActivityHistory resourceId={activity._id} />
        </div>
      </div>
    </div>
  );
};

export default ActivityDetails;
