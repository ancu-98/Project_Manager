import { RecentProjects } from "@/components/dashboard/recent-projects";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatisticsCharts } from "@/components/dashboard/statistics-charts";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { UpcomingActivities } from "@/components/upcoming-activities";
import { CreateWorkspace } from "@/components/workspace/create-workspace";
import { useGetWorkspaceStatsQuery } from "@/hooks/use-workspace";
import type {
  Activity,
  ActivityPriorityData,
  ActivityTrendData,
  Project,
  ProjectStatusData,
  StatsCardProps,
  WorkspaceProductivityData,
} from "@/types/app";
import { LayoutDashboard, LucideTelescope, PlusCircle } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

  const { data, isPending } = useGetWorkspaceStatsQuery(workspaceId! || '') as {
    data: {
      stats: StatsCardProps;
      activityTrendData: ActivityTrendData[];
      activityPriorityData: ActivityPriorityData[];
      projectStatusData: ProjectStatusData[];
      workspaceProductivityData: WorkspaceProductivityData[];
      upcomingActivities: Activity[];
      recentProjects: Project[];
      workspaceProjects: Project[];
    };
    isPending: boolean;
  };

  if (!workspaceId) {
    return (
      <div className="space-y-8 2x1:space-y-12 py-4 h-full">
        <div className="flex items-center justify-between">
          <h1 className="text-2x1 font-bold">Dashboard</h1>
        </div>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon" className="w-16 h-16">
              <LayoutDashboard className="w-8 h-8" />
            </EmptyMedia>
            <EmptyTitle>Select a Workspace</EmptyTitle>
            <EmptyDescription>
              Choose a workspace from the header to view your dashboard and
              manage your projects
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex gap-2">
              <Button onClick={() => setIsCreatingWorkspace(true)}>
                <PlusCircle className="size-4 mr-2" />
                New Workspace
              </Button>
              <Button>
                <LucideTelescope className="size-4 mr-2"/>
                Explore Workspaces
              </Button>
            </div>
          </EmptyContent>
        </Empty>
        <CreateWorkspace
          isCreatingWorkspace={isCreatingWorkspace}
          setIsCreatingWorkspace={setIsCreatingWorkspace}
        />
      </div>
    );
  }

  if (isPending) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-8 2x1:space-y-12 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2x1 font-bold">Dashboard</h1>
      </div>

      <StatCard data={data.stats} />

      <StatisticsCharts
        stats={data.stats}
        activityTrendData={data.activityTrendData}
        projectStatusData={data.projectStatusData}
        activityPriorityData={data.activityPriorityData}
        workspaceProductivityData={data.workspaceProductivityData}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentProjects data={data.recentProjects} />
        <UpcomingActivities
          workspaceProjects={data.workspaceProjects}
          data={data.upcomingActivities}
        />
      </div>
    </div>
  );
};

export default Dashboard;
