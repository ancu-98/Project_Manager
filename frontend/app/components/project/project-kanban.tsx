import type { Activity, ActivityStatus, Project, Sprint } from "@/types/app";
import { useState } from "react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "../ui/card";
import { useFinishStartedSprintMutation } from "@/hooks/use-sprint";
import { toast } from "sonner";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import {
  AlertCircle,
  Calendar,
  CalendarArrowDown,
  CalendarCog,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { format } from "date-fns";

interface ProjectKanbanProps {
  project: Project;
  backlogSprints: Sprint[];
}

const ProjectKanban = ({ project, backlogSprints }: ProjectKanbanProps) => {
  const [activityFilter, setActivityFilter] = useState<ActivityStatus | "All">(
    "All"
  );

  // Obtener el sprint que está iniciado
  const startedSprint = backlogSprints.find(
    (sprint) => sprint.isStarted === true
  );

  // Obtener Id del sprint iniciado
  const startedSprintId = startedSprint?._id || "";

  // Obtener las actividades del sprint iniciado
  const sprintActivities = startedSprint?.activities || [];

  const { mutate: achievedSprint, isPending } = useFinishStartedSprintMutation(
    project._id
  );

  const handleFinishStartedSprint = () => {
    achievedSprint(
      {
        sprintId: startedSprintId,
      },
      {
        onSuccess: () => {
          toast.success("Started Sprint finished successfully");
        },
        onError: (error: any) => {
          const errorMessage = error.response.data.message;
          toast.error(errorMessage);
          console.log(error);
        },
      }
    );
  };

  const navigate = useNavigate();

  const handleActivityClick = (activityId: string) => {
    navigate(
      `/workspaces/${project.workspace}/projects/${project._id}/backlog/activities/${activityId}`
    );
  };

  if (!startedSprint) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="w-16 h-16 flex-shrink-0">
            <CalendarCog className="w-8 h-8" />
            <CalendarArrowDown className="w-8 h-8" />
          </EmptyMedia>
          <EmptyTitle>Start whit the Backlog</EmptyTitle>
          <EmptyDescription>
            Plan and start a sprint to see the activities here
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setActivityFilter("All")}>
                All Activities
              </TabsTrigger>
              <TabsTrigger
                value="todo"
                onClick={() => setActivityFilter("All")}
              >
                To Do
              </TabsTrigger>
              <TabsTrigger
                value="in-progress"
                onClick={() => setActivityFilter("In Progress")}
              >
                In Progress
              </TabsTrigger>
              <TabsTrigger
                value="done"
                onClick={() => setActivityFilter("Done")}
              >
                Done
              </TabsTrigger>
            </TabsList>

            <h1 className="mr-8">{startedSprint.sprintName}</h1>

            <Button
              variant="destructive"
              onClick={handleFinishStartedSprint}
              disabled={isPending}
            >
              {isPending ? "Archiving..." : "Finish Sprint"}
            </Button>
          </div>

          <TabsContent value="all" className="m-0">
            <div className="grid grid-cols-3 gap-4">
              <ActivityColumn
                title="To Do"
                activities={sprintActivities.filter(
                  (activitie) => activitie.status === "To Do"
                )}
                onActivityClick={handleActivityClick}
              />

              <ActivityColumn
                title="In Progress"
                activities={sprintActivities.filter(
                  (activitie) => activitie.status === "In Progress"
                )}
                onActivityClick={handleActivityClick}
              />

              <ActivityColumn
                title="Done"
                activities={sprintActivities.filter(
                  (activitie) => activitie.status === "Done"
                )}
                onActivityClick={handleActivityClick}
              />
            </div>
          </TabsContent>

          <TabsContent value="todo" className="m-0">
            <div className="grid md:grid-cols-1 gap-4">
              <ActivityColumn
                title="To Do"
                activities={sprintActivities.filter(
                  (activitie) => activitie.status === "To Do"
                )}
                onActivityClick={handleActivityClick}
                isFullWidth
              />
            </div>
          </TabsContent>

          <TabsContent value="in-progress" className="m-0">
            <div className="grid md:grid-cols-1 gap-4">
              <ActivityColumn
                title="In Progress"
                activities={sprintActivities.filter(
                  (activitie) => activitie.status === "In Progress"
                )}
                onActivityClick={handleActivityClick}
                isFullWidth
              />
            </div>
          </TabsContent>

          <TabsContent value="done" className="m-0">
            <div className="grid md:grid-cols-1 gap-4">
              <ActivityColumn
                title="Done"
                activities={sprintActivities.filter(
                  (activitie) => activitie.status === "Done"
                )}
                onActivityClick={handleActivityClick}
                isFullWidth
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectKanban;

interface ActivityColumProps {
  title: string;
  activities: Activity[];
  onActivityClick: (activityId: string) => void;
  isFullWidth?: boolean;
}

const ActivityColumn = ({
  title,
  activities,
  onActivityClick,
  isFullWidth = false,
}: ActivityColumProps) => {
  return (
    <div
      className={
        isFullWidth
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : ""
      }
    >
      <div
        className={cn(
          "space-y-4",
          !isFullWidth ? "h-full" : "col-span-full mb-4"
        )}
      >
        {!isFullWidth && (
          <div className="flex gap-4">
            <h1 className="font-medium">{title}</h1>
            <Badge variant="outline" className="">
              {activities.length}
            </Badge>
          </div>
        )}

        <div
          className={cn(
            "space-y-3",
            isFullWidth && "grid grid-cols-2 lg:grid-cols-3 gap-4"
          )}
        >
          {activities.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">
              No activities yet
            </div>
          ) : (
            activities.map((activity) => (
              <ActivityCard
                key={activity._id}
                activity={activity}
                onClick={() => onActivityClick(activity._id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const ActivityCard = ({
  activity,
  onClick,
}: {
  activity: Activity;
  onClick: () => void;
}) => {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:shadow-md transition-all duration-300 hover:translate-y-1"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge
            className={
              activity.priority === "High"
                ? "bg-red-500 text-white"
                : activity.priority === "Medium"
                  ? "bg-orange-500 text-white"
                  : "bg-slate-500 text-white"
            }
          >
            {activity.priority}
          </Badge>

          <div className="flex gap-1">
            {activity.status !== "To Do" && (
              <Button
                variant={"ghost"}
                size={"icon"}
                className="size-6"
                onClick={() => {
                  console.log("mark as to do");
                }}
                title="Mark as To Do"
              >
                <AlertCircle className={cn("size-4")} />
                <span className="sr-only">Mark as To Do</span>
              </Button>
            )}
            {activity.status !== "In Progress" && (
              <Button
                variant={"ghost"}
                size={"icon"}
                className="size-6"
                onClick={() => {
                  console.log("mark as in progress");
                }}
                title="Mark as In Progress"
              >
                <Clock className={cn("size-4")} />
                <span className="sr-only">Mark as In Progress</span>
              </Button>
            )}
            {activity.status !== "Done" && (
              <Button
                variant={"ghost"}
                size={"icon"}
                className="size-6"
                onClick={() => {
                  console.log("mark as done");
                }}
                title="Mark as Done"
              >
                <CheckCircle className={cn("size-4")} />
                <span className="sr-only">Mark as Done</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <h4 className="font-medium mb-2">{activity.title}</h4>
        {activity.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {activity.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {activity.assignees && activity.assignees.length > 0 && (
              <div className="flex space-x-2">
                {activity.assignees.slice(0, 5).map((member) => (
                  <Avatar
                    key={member._id}
                    className="relative size-8 bg-gray-700 rounded-full border-2 border-background"
                    title={member.name}
                  >
                    <AvatarImage src={member.profilePicture} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}
                {activity.assignees.length > 5 && (
                  <span className="text-xs text-muted-foreground">
                    + {activity.assignees.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>
          {activity.dueDate && (
            <div className="text-xs text-muted-foreground flex items-center">
              <Calendar className="size-3 mr-1" />
              {format(new Date(activity.dueDate), "MMM d, yyyy")}
            </div>
          )}
        </div>

        {activity.subtasks && activity.subtasks.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            {activity.subtasks.filter((subtask) => subtask.completed).length} /{" "}
            {activity.subtasks.length}
            {activity.subtasks.length} subtasks
          </div>
        )}
      </CardContent>
    </Card>
  );
};
