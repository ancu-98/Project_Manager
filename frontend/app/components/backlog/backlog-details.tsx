import {
  TypeOfActivity,
  type Activity,
  type Backlog,
  type Project,
  type ProjectMemberRole,
  type Sprint,
  type User,
} from "@/types/app";
import { CreateActivityDialog } from "../activity/create-activity-dialog";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Calendar,
  CalendarArrowUp,
  CalendarPlus,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Ellipsis,
  PlusCircle,
  SquareSquare,
  Trash2Icon,
} from "lucide-react";
import { useNavigate } from "react-router";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "../ui/item";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { Badge } from "../ui/badge";
import StartSprintDialog from "../sprint/start-sprint-dialog";
import {
  useAchievedSprintMutation,
  useAddActivityToSprintMutation,
  useCreateSprintMutation,
} from "@/hooks/use-sprint";
import { toast } from "sonner";
import { format } from "date-fns";
import { ButtonGroup } from "../ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useReturnSprintActivitytoProjectBacklogMutation } from "@/hooks/use-project";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getActivityTypeOfsymbols } from "@/lib/app";
import { cn } from "@/lib/utils";

interface BacklogDetailsProps {
  project: Project;
  backlogActivities: Activity[];
  backlogSprints: Sprint[];
  projectMembers: {
    user: User;
    role: ProjectMemberRole;
  }[];
}

const BacklogDetails = ({
  project,
  backlogActivities,
  backlogSprints,
  projectMembers,
}: BacklogDetailsProps) => {
  const { mutate: createSprint, isPending } = useCreateSprintMutation();

  const handleCreateSprint = () => {
    createSprint(project._id!, {
      onSuccess: () => {
        // setIsCreateSprint(true);
        toast.success("Sprint created Succesfully");
      },
      onError: (error: any) => {
        const errorMessage = error.response.data.message;
        toast.error(errorMessage);
        console.log(error);
      },
    });
  };

  const [isCreateActivity, setIsCreateActivity] = useState(false);

  const calculateStoryPoints = () => {
    const stories =
      backlogActivities?.filter(
        (activity) => activity.typeOf === TypeOfActivity.STORY
      ) || [];

    const toDo = stories
      .filter((activity) => activity.status === "To Do")
      .reduce((sum, activity) => sum + (activity.storyPointEstimate || 0), 0);

    const inProgress = stories
      .filter((activity) => activity.status === "In Progress")
      .reduce((sum, activity) => sum + (activity.storyPointEstimate || 0), 0);

    const done = stories
      .filter((activity) => activity.status === "Done")
      .reduce((sum, activity) => sum + (activity.storyPointEstimate || 0), 0);

    return { toDo, inProgress, done };
  };

  const storyPoints = calculateStoryPoints();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateActivity(true)}>Add Activity</Button>

        <CreateActivityDialog
          open={isCreateActivity}
          onOpenChange={setIsCreateActivity}
          projectId={project._id!}
          projectMembers={projectMembers}
        />
      </div>
      <div className="space-y-4">
        {/* Div para sprints */}
        <div className="space-y-4">
          {backlogSprints.length == 0 ? (
            <div>Hola</div>
          ) : (
            backlogSprints.map((sprint) => (
              <ProjectSprint
                key={sprint._id}
                project={project}
                sprint={sprint}
                backlogActivites={backlogActivities}
                backlogSprints={backlogSprints}
              />
            ))
          )}
        </div>

        {/* Div para backlog */}
        <div className="border rounded-md bg-white shadow-sm">
          <div className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 hover:rounded-md">
            {/* Izquierda: Flecha + Checkbox + Título */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? (
                  <ChevronDown size={16} className="text-gray-600" />
                ) : (
                  <ChevronRight size={16} className="text-gray-600" />
                )}
              </Button>
              <span className="font-semibold">Backlog</span>
              <span className="text-gray-500 text-sm">
                ({backlogActivities?.length} activities)
              </span>
            </div>

            {/* Derecha: Contadores + Botón */}
            <div className="flex justify-between gap-2">
              <Tooltip>
                <TooltipTrigger>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    {storyPoints.toDo}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Story points To Do</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-bue-300">
                    {storyPoints.inProgress}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Story points In Progress</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 mr-8">
                    {storyPoints.done}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="mr-8">
                  Story points Done
                </TooltipContent>
              </Tooltip>

              <Button
                onClick={handleCreateSprint}
                variant="outline"
                className="cursor-pointer"
                disabled={isPending}
              >
                <PlusCircle size={14} />
                {isPending ? "Creating..." : "Add Sprint"}
              </Button>
            </div>
          </div>

          {isOpen && (
            <div className="space-y-2 border-t bg-gray-50 p-4 text-sm text-gray-700 rounded-b-md">
              {backlogActivities.length === 0 ? (
                <div className="flex flex-row items-center justify-start w-full border-1 border-dashed rounded-md p-4">
                  <EmptyMedia
                    variant="icon"
                    className="w-16 h-16 flex-shrink-0"
                  >
                    <CalendarPlus className="w-8 h-8" />
                    <CalendarArrowUp className="w-8 h-8" />
                  </EmptyMedia>

                  <div className="ml-4 flex-1 text-left">
                    <EmptyTitle className="font-semibold">
                      Plan your Sprint
                    </EmptyTitle>
                    <EmptyDescription className="text-sm mt-1">
                      Add activities from the backlog or create new activities
                      to plan the work for this Sprint. Select{" "}
                      <span className="font-medium">Start Sprint</span> when you
                      are ready.
                    </EmptyDescription>
                  </div>
                </div>
              ) : (
                backlogActivities.map((activity) => (
                  <ActivityRowItem
                    key={activity._id}
                    project={project}
                    backlogActivities={backlogActivities}
                    activity={activity}
                    backlogSprints={backlogSprints}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BacklogDetails;

interface ProjectSprintProps {
  project: Project;
  sprint: Sprint;
  backlogActivites: Activity[];
  backlogSprints: Sprint[];
}

const ProjectSprint = ({
  project,
  sprint,
  backlogActivites,
  backlogSprints,
}: ProjectSprintProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isStartingSprint, setIsStartingSprint] = useState(false);

  // Condición 1: Sprint sin actividades
  const hasActivities = (sprint?.activities?.length ?? 0) > 0;

  // Condición 2: Existe al menos un sprint iniciado en el backlog
  const isAnySprintStarted = backlogSprints.some((sp) => sp.isStarted === true);

  //Condición 3: Encontrar si el sprint actual es el sprint iniciado
  const isCurrentSprintStarted = sprint.isStarted === true;

  const calculateStoryPoints = () => {
    const stories =
      sprint.activities?.filter(
        (activity) => activity.typeOf === TypeOfActivity.STORY
      ) || [];

    const toDo = stories
      .filter((activity) => activity.status === "To Do")
      .reduce((sum, activity) => sum + (activity.storyPointEstimate || 0), 0);

    const inProgress = stories
      .filter((activity) => activity.status === "In Progress")
      .reduce((sum, activity) => sum + (activity.storyPointEstimate || 0), 0);

    const done = stories
      .filter((activity) => activity.status === "Done")
      .reduce((sum, activity) => sum + (activity.storyPointEstimate || 0), 0);

    return { toDo, inProgress, done };
  };

  const storyPoints = calculateStoryPoints();

  const { mutate: achievedSprint, isPending } = useAchievedSprintMutation(
    project._id
  );

  const handleDeleteSprint = () => {
    achievedSprint(
      {
        sprintId: sprint._id,
      },
      {
        onSuccess: () => {
          toast.success("Sprint deleted successfully");
        },
        onError: (error: any) => {
          const errorMessage = error.response.data.message;
          toast.error(errorMessage);
          console.log(error);
        },
      }
    );
  };

  const renderSprintButton = () => {
    if (isCurrentSprintStarted) {
      return (
        <Button variant="outline" disabled>
          <CheckCircle size={14} />
          Current Sprint
        </Button>
      );
    }

    if (isAnySprintStarted) {
      return (
        <Tooltip>
          <TooltipTrigger>
            <Button variant="outline" disabled>
              <PlusCircle size={14} />
              Start Sprint
            </Button>
          </TooltipTrigger>
          <TooltipContent>Work on current Sprint</TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Button
        onClick={() => setIsStartingSprint(true)}
        variant="outline"
        disabled={!hasActivities}
      >
        <PlusCircle size={14} />
        Start Sprint
      </Button>
    );
  };

  return (
    <div className="border rounded-md bg-white shadow-sm">
      <div className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 hover:rounded-md">
        {/* Izquierda: Flecha + Checkbox + Título */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <ChevronDown size={16} className="text-gray-600" />
            ) : (
              <ChevronRight size={16} className="text-gray-600" />
            )}
          </Button>
          <span className="font-semibold">{`${sprint.sprintName} ${(backlogSprints.indexOf(sprint) ?? -1) + 1}`}</span>
          <span className="text-gray-500 text-sm">
            {sprint.startDay && sprint.finishDay
              ? `${format(new Date(sprint.startDay), "MMM d")} - ${format(new Date(sprint.finishDay), "MMM d yyyy")}`
              : "No dates set"}
          </span>
          <span className="text-gray-500 text-sm">
            ({sprint.activities?.length} activities)
          </span>
        </div>

        {/* Derecha: Contadores + Botón */}
        <div className="flex justify-between gap-2">
          <Tooltip>
            <TooltipTrigger>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                {storyPoints.toDo}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Story points To Do</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-bue-300">
                {storyPoints.inProgress}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Story points In Progress</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 mr-8">
                {storyPoints.done}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="mr-8">Story points Done</TooltipContent>
          </Tooltip>

          {renderSprintButton()}

          <ButtonGroup>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 mt-0.5 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer gap-2">
                  <Ellipsis />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  {isCurrentSprintStarted ? (
                    <DropdownMenuItem onClick={() => setIsStartingSprint(true)}>
                      Edit Sprint
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={handleDeleteSprint}
                      disabled={isPending}
                    >
                      <Trash2Icon />
                      {isPending ? "Archiving..." : "Delete Sprint"}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </ButtonGroup>
        </div>
      </div>
      {isOpen && (
        <div className="space-y-2 border-t bg-gray-50 p-4 text-sm text-gray-700 rounded-b-md">
          {sprint.activities?.length === 0 ? (
            <div className="flex flex-row items-center justify-start w-full border-1 border-dashed rounded-md p-4">
              <EmptyMedia variant="icon" className="w-16 h-16 flex-shrink-0">
                <CalendarPlus className="w-8 h-8" />
                <CalendarArrowUp className="w-8 h-8" />
              </EmptyMedia>

              <div className="ml-4 flex-1 text-left">
                <EmptyTitle className="font-semibold">
                  Plan your Sprint
                </EmptyTitle>
                <EmptyDescription className="text-sm mt-1">
                  Add activities from the backlog or create new activities to
                  plan the work for this Sprint. Select{" "}
                  <span className="font-medium">Start Sprint</span> when you are
                  ready.
                </EmptyDescription>
              </div>
            </div>
          ) : (
            sprint.activities?.map((activity) => (
              <ActivityRowItem
                key={activity._id}
                project={project}
                backlogActivities={backlogActivites}
                activity={activity}
                backlogSprints={backlogSprints}
              />
            ))
          )}
        </div>
      )}
      <StartSprintDialog
        open={isStartingSprint}
        onOpenChange={setIsStartingSprint}
        sprint={sprint}
        projectId={project._id}
      />
    </div>
  );
};

interface ActivityRowItemProps {
  project: Project;
  activity: Activity;
  backlogActivities: Activity[];
  backlogSprints: Sprint[];
}

const ActivityRowItem = ({
  project,
  activity,
  backlogActivities,
  backlogSprints,
}: ActivityRowItemProps) => {
  const [isAddToSprintId, setIsAddToSprintId] = useState("");
  const [isOnBacklog, setIsOnBacklog] = useState(true);

  useEffect(() => {
    if (activity.isOnSprint) {
      setIsOnBacklog(false);
    }
  }, [activity.isOnSprint]);

  const { mutate: returnActivityToBacklog, isPending: isReturningPending } =
    useReturnSprintActivitytoProjectBacklogMutation();

  const handleReturnToBacklog = () => {
    returnActivityToBacklog(
      {
        projectId: project._id,
        activityId: activity._id,
      },
      {
        onSuccess: () => {
          toast.success("Activity returned to project backlog");
          setIsOnBacklog(true);
        },
        onError: (error: any) => {
          const errorMessage = error.response.data.message;
          toast.error(errorMessage);
          console.log(error);
        },
      }
    );
  };

  const { mutate: addActivityToSprint, isPending } =
    useAddActivityToSprintMutation(project._id);

  const handleAddToSprint = (sprintId: string) => {
    addActivityToSprint(
      {
        sprintId: sprintId,
        activityId: activity._id,
      },
      {
        onSuccess: () => {
          toast.success("Activity added to sprint");
          setIsAddToSprintId("");
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

  const activityType = getActivityTypeOfsymbols(
    activity.typeOf as TypeOfActivity
  );
  const Icon = activityType?.symbol;

  return (
    <Item variant="outline" className="h-12 py-1">
      <ItemContent className="items-center align-middle" >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Tooltip>
            <TooltipTrigger>
              <ItemMedia className={cn("rounded p-1.5 mb-1", activityType?.color)}>
                {Icon && <Icon className="size-4" />}
              </ItemMedia>
            </TooltipTrigger>
            <TooltipContent>{activity.typeOf}</TooltipContent>
          </Tooltip>
          <div className="min-w-0 flex-1 flex flex-row gap-2" >
            <ItemTitle className="truncate min-w-24">{activity.title}</ItemTitle>
              {activity.description && (
                <ItemDescription className="line-clamp-1 text-sm text-muted-foreground">
                  {activity.description}
                </ItemDescription>
              )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger>
              <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
                PRINCIPAL
              </Badge>
            </TooltipTrigger>
            <TooltipContent>principal activity</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
                {activity.storyPointEstimate || 0}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Story points Estimate</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <ItemMedia
                className={cn(
                  "rounded p-1 mb-1 bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                )}
              >
                <SquareSquare />
              </ItemMedia>
            </TooltipTrigger>
            <TooltipContent>{activity.priority}</TooltipContent>
          </Tooltip>
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
      </ItemContent>
      <ItemSeparator />
      <ItemActions className="pb-0.5" >
        <ButtonGroup>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 mt-0.5 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer gap-2">
                <Ellipsis />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => handleActivityClick(activity._id)} >Edit Activity</DropdownMenuItem>
                {isOnBacklog ? (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      Add to Sprint
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup
                        value={isAddToSprintId}
                        onValueChange={(value) => {
                          setIsAddToSprintId(value);
                          handleAddToSprint(value);
                        }}
                      >
                        {backlogSprints.map((sp) => (
                          <DropdownMenuRadioItem
                            key={sp._id}
                            value={sp._id}
                            disabled={isPending}
                            className="px-4"
                          >
                            {`${sp.sprintName} ${(backlogSprints.indexOf(sp) ?? -1) + 1}`}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                ) : (
                  <DropdownMenuItem
                    onClick={handleReturnToBacklog}
                    disabled={isReturningPending}
                  >
                    Return to Backlog
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem variant="destructive">
                  <Trash2Icon />
                  Achive
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
      </ItemActions>
    </Item>
  );
};
