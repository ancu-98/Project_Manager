import { getProjectProgress } from "@/lib/app";
import type { Activity, ActivityStatus, Sprint } from "@/types/app";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";

interface ProjectProgressProps {
  backlogSprints: Sprint[];
}

const ProjectProgress = ({
  backlogSprints
}: ProjectProgressProps) => {

  // Extraer todas las actividades de todos los sprints
  const allSprintActivities = backlogSprints.flatMap(
    (sprint) => sprint.activities || []
  );

  const projectProgress = getProjectProgress(allSprintActivities);

  const toDoCount = allSprintActivities.filter(
    (activity) => activity.status === "To Do"
  ).length;

  const inProgressCount = allSprintActivities.filter(
    (activity) => activity.status === "In Progress"
  ).length;

  const doneCount = allSprintActivities.filter(
    (activity) => activity.status === "Done"
  ).length;

  return (
    <div className="flex flex-col gap-4 lg:min-w-[200px]">
      {/* Progress Container */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
            Progress:
          </span>
          <Progress value={projectProgress} className="h-2 flex-1" />
          <span className="text-xs font-medium text-gray-600 min-w-fit">
            {projectProgress}%
          </span>
        </div>

        {/* Status Badges Container */}
         <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm sm:text-xs">
          <span className="text-muted-foreground text-xs sm:text-sm">
            Status:
          </span>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-background text-xs">
              {toDoCount} To Do
            </Badge>
            <Badge variant="outline" className="bg-background text-xs">
              {inProgressCount} In Progress
            </Badge>
            <Badge variant="outline" className="bg-background text-xs">
              {doneCount} Done
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectProgress;
