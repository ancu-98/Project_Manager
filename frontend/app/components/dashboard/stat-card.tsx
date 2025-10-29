import type { StatsCardProps } from "@/types/app";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export const StatCard = ({ data }: { data: StatsCardProps }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalProjects}</div>
          <p className="text-xs text-muted-foreground">
            {data.totalProjectsInProgress} in progress
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Total Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalActivities}</div>
          <p className="text-xs text-muted-foreground">
            {data.totalActivitiesCompleted} completed
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">To Do</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalActivitiesToDo}</div>
          <p className="text-xs text-muted-foreground">
            Activities waiting to be done
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.totalActivitiesInProgress}
          </div>
          <p className="text-xs text-muted-foreground">
            Activities currently in progress
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
