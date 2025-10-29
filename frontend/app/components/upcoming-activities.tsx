import type { Activity, Project } from "@/types/app";
import { Link, useSearchParams } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";
import { format } from "date-fns";

export const UpcomingActivities = ({
  data,
  workspaceProjects,
}: {
  data: Activity[];
  workspaceProjects: Project[];
}) => {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Activities</CardTitle>
        <CardDescription>
          Here are the activities that are due soon
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4" >
        {data.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No uncoming activities yet
          </p>
        ) : (
          data.map((activity) => {
            const project = workspaceProjects.find(
              (project) => project.backlog === activity.backlog
            );

            return (
              <Link
                to={`/workspaces/${workspaceId}/projects/${project?._id}/backlog/activities/${activity._id}`}
                key={activity._id}
                className="flex items-start space-x-3 border-b pb-3 last:border-0"
              >
                <div
                  className={cn(
                    "mt-0.5 rounded-full p-1",
                    activity.priority === "High" && "bg-red-100 text-red-700",
                    activity.priority === "Medium" &&
                      "bg-yellow-100 text-yellow-700",
                    activity.priority === "Low" && "bg-gray-100 text-gray-700"
                  )}
                >
                  {activity.status === "Done" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm md:text-base">
                    {activity.title}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>{activity.status}</span>
                    {activity.dueDate && (
                      <>
                        <span className="mx-1"> - </span>
                        <span>
                          {format(new Date(activity.dueDate), "MMM d, yyyy")}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
