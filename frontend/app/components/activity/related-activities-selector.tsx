import type { Activity, Sprint, TypeOfActivity } from "@/types/app";
import { useAddRelatedActivityMutation, useRemoveRelatedActivityMutation } from "@/hooks/use-activity";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { useState } from "react";
import { Delete } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface RelatedActivitiesSelectorProps {
  activityId: string;
  typeOfActivity: TypeOfActivity;
  isOnSprint: boolean;
  isOnBacklog: boolean;
  isRelatedActivity: boolean;
  backlogActivities: Activity[];
  backlogSprints: Sprint[];
  relatedActivities: Activity[];
}

const RelatedActivitiesSelector = ({
  activityId,
  typeOfActivity,
  isOnSprint,
  isOnBacklog,
  isRelatedActivity,
  backlogActivities,
  backlogSprints,
  relatedActivities,
}: RelatedActivitiesSelectorProps) => {
  const [showSelector, setShowSelector] = useState(false);
  const [showRelated, setShowRelated] = useState(false);

  const { mutate: addRelatedActivity, isPending } =
    useAddRelatedActivityMutation();

  const handleAddRelatedActivity = (relatedActivityId: string) => {
    addRelatedActivity(
      {
        activityId: activityId,
        relatedActivityId: relatedActivityId,
      },
      {
        onSuccess: () => {
          toast.success("Related activity added successfully");
          setShowSelector(false);
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || "Failed to add related activity"
          );
          console.error("Error adding related activity:", error);
        },
      }
    );
  };

  const { mutate: removeRelatedActivity, isPending: isRemoving } = useRemoveRelatedActivityMutation();


  const handleRemoveRelatedActivity = (relatedActivityId: string) => {
    removeRelatedActivity(
      {
        activityId: activityId,
        relatedActivityId: relatedActivityId,
      },
      {
        onSuccess: () => {
          toast.success("Related activity removed successfully");
          // ✅ Ejecutar callback para actualizar el componente padre
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to remove related activity");
          console.error("Error removing related activity:", error);
        },
      }
    );
  };

  // Filtrar actividades
  const backlogStoryActivities = backlogActivities.filter(
    (activity) => activity.typeOf === "Story" && !activity.principal
  );
  const backlogTaskActivities = backlogActivities.filter(
    (activity) => activity.typeOf === "Task" && !activity.principal
  );
  const backlogSubtaskActivities = backlogActivities.filter(
    (activity) => activity.typeOf === "Subtask" && !activity.principal
  );

  const allSprintActivities: Activity[] = backlogSprints.flatMap(
    (sprint) => sprint.activities || []
  );

  const sprintStoryActivities = allSprintActivities.filter(
    (activity) => activity.typeOf === "Story" && !activity.principal
  );
  const sprintTaskActivities = allSprintActivities.filter(
    (activity) => activity.typeOf === "Task" && !activity.principal
  );
  const sprintSubtaskActivities = allSprintActivities.filter(
    (activity) => activity.typeOf === "Subtask" && !activity.principal
  );

  // Determinar qué actividades mostrar según el tipo
  const getAvailableActivities = () => {
    if (typeOfActivity === "Epic") {
      return {
        sprint: sprintStoryActivities,
        backlog: backlogStoryActivities,
        label: "Story",
      };
    } else if (typeOfActivity === "Story") {
      return {
        sprint: sprintTaskActivities,
        backlog: backlogTaskActivities,
        label: "Task",
      };
    } else if (typeOfActivity === "Task") {
      return {
        sprint: sprintSubtaskActivities,
        backlog: backlogSubtaskActivities,
        label: "Subtask",
      };
    }
    return { sprint: [], backlog: [], label: "" };
  };

  const availableActivities = getAvailableActivities();
  const hasActivities =
    availableActivities.sprint.length > 0 ||
    availableActivities.backlog.length > 0;

  if (typeOfActivity === "Subtask") {
    return (
      <div className="w-full m-4">
        <p className="text-sm text-muted-foreground">
          Subtask activities cannot have related activities
        </p>
      </div>
    );
  }

  return (
    <div className="w-full mt-2  md:mt-1 md:px-2">
      {/* Botones en fila/columna */}
      <div className="flex flex-col md:flex-row gap-2">
        {/* Botón para agregar - con posición relativa para el panel */}
        <div className="relative flex-1 md:max-w-80">
          <Button
            variant="outline"
            onClick={() => {
              setShowSelector(!showSelector);
              if (showRelated) setShowRelated(false);
            }}
            disabled={isPending}
            className="w-full"
          >
            Add Related Activities
          </Button>

          {/* Panel flotante - posición absoluta */}
          {showSelector && (
            <div className="absolute top-full left-0 right-0 mt-2 border rounded-lg p-4 bg-card shadow-lg z-50 max-h-96 overflow-y-auto">
              {!hasActivities ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No {availableActivities.label} activities available
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Actividades del Sprint */}
                  {availableActivities.sprint.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        {availableActivities.label} Activities (Sprint)
                      </h4>
                      <div className="space-y-1">
                        {availableActivities.sprint.map((activity) => (
                          <button
                            key={activity._id}
                            onClick={() =>
                              handleAddRelatedActivity(activity._id)
                            }
                            disabled={isRemoving}
                            className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent transition-colors disabled:opacity-50"
                          >
                            {activity.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actividades del Backlog */}
                  {availableActivities.backlog.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        {availableActivities.label} Activities (Backlog)
                      </h4>
                      <div className="space-y-1">
                        {availableActivities.backlog.map((activity) => (
                          <button
                            key={activity._id}
                            onClick={() =>
                              handleAddRelatedActivity(activity._id)
                            }
                            disabled={isPending}
                            className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent transition-colors disabled:opacity-50"
                          >
                            {activity.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botón para mostrar relacionadas - solo si hay actividades */}
        {relatedActivities && relatedActivities.length > 0 && (
          <div className="relative flex-1">
            <Button
              variant="outline"
              onClick={() => {
                setShowRelated(!showRelated);
                if (showSelector) setShowSelector(false);
              }}
              className="w-full"
            >
              Related Activities ({relatedActivities.length})
            </Button>

            {/* Panel flotante - posición absoluta */}
            {showRelated && (
              <div className="absolute top-full left-0 right-0 mt-2 border rounded-lg p-4 bg-card shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {relatedActivities.map((activity) => (
                    <div
                      key={activity._id}
                      className="flex items-center justify-between px-3 py-2 text-sm rounded bg-muted hover:bg-muted/80"
                    >
                      <span className="flex-1 truncate">{activity.title}</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 ml-2 flex-shrink-0 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() =>
                              handleRemoveRelatedActivity(activity._id)
                            }
                          >
                            <Delete className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>remove related activity</TooltipContent>
                      </Tooltip>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RelatedActivitiesSelector;
