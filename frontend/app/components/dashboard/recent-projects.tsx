import type { Project } from "@/types/app";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { getActivityStatusColor, getProjectProgress } from "@/lib/app";
import { Link, useSearchParams } from "react-router";
import { cn } from "@/lib/utils";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";

export const RecentProjects = ({ data }: { data: Project[] }) => {
    const [searchParams] = useSearchParams();
    const workspaceId = searchParams.get('workspaceId');

  return (
    <Card className="lg:col-spa-2">
      <CardHeader>
        <CardTitle>Recent Projects</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4" >
        {data.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No recent project yet
          </p>
        ) : (
          data.map((project) => {
            // Actividades del backlog
            const backlogActivities = project.backlog?.activities || [];

            // Actividades de todos los sprints
            const sprintActivities =
              project.backlog?.sprints?.flatMap(
                (sprint) => sprint.activities || []
              ) || [];

            // Combinar todas las actividades del proyecto
            const allProjectActivities = [...backlogActivities, ...sprintActivities];

            const projectProgress = getProjectProgress(allProjectActivities);
            return (
              <div key={project._id} className="border rounded-lg p-4" >
                <div className="flex items-center justify-between mb-2">
                    <Link to={`/workspaces/${workspaceId}/projects/${project._id}/backlog`} >
                        <h3 className="font-medium hover:text-primary transition-colors">
                            {project.title}
                        </h3>
                    </Link>
                    <Badge className={cn('px-2 py-1 text-xs rounded-full', getActivityStatusColor(project.status))} >
                        {project.status}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{project.description}</p>
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                        <span>Progress</span>
                        <span>{projectProgress}%</span>
                    </div>

                    <Progress value={projectProgress} className="h-2" />

                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
