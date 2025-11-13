import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
import type {
  Backlog,
  Project,
} from "@/types/app";
import { useState } from "react";
import { Link, useParams } from "react-router";
import ProjectKanban from "@/components/project/project-kanban";
import ProjectSummary from "@/components/project/project-summary";
import BacklogDetails from "@/components/backlog/backlog-details";
import { useProjectBacklogActivitiesQuery } from "@/hooks/use-project";
import ProjectProgress from "@/components/project/project-progress";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


const ProjectDetails = () => {
  const { projectId } = useParams<{
    projectId: string;
  }>();

  const [activeTab, setActiveTab] = useState<"summary" | "backlog" | "kanban">(
    "summary"
  );

  const { data, isLoading } = useProjectBacklogActivitiesQuery(projectId!) as {
    data: {
      project: Project;
      backlog: Backlog;
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
    <div className="space-y-0">
      <div className="border-b border-gray-200 bg-white p-4">
        {/* Container principal responsive */}
        <div className="flex flex-col gap-4">
          {/* Fila superior: Back+Title y Progress+Status */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            {/* Left side: Back button and Title */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <BackButton />
                <h1 className="text-xl sm:text-2xl font-bold">
                  {data.project.title}
                </h1>
              </div>
            </div>

            <div className="flex flex-row gap-2">
              <ProjectProgress
                backlogSprints={data.backlog.sprints as any}
                backlogActivities={data.backlog.activities as any}
              />

              <Tooltip>
                <TooltipTrigger>
                  <Link to={`/workspaces/${data.project.workspace}/projects/${data.project._id}/backlog/settings`}>
                    <Button variant={'ghost'}>
                      <Settings className="size-5"/>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Project Settings</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Tabs*/}
          <div className="flex gap-0 border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab("summary")}
              className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "summary"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab("backlog")}
              className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "backlog"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Backlog
            </button>
            <button
              onClick={() => setActiveTab("kanban")}
              className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "kanban"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Kanban
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-4 px-4">
        {activeTab === "summary" && (
          <ProjectSummary
            project={data.project}
            backlog={data.backlog}
          />
        )}
        {activeTab === "backlog" && (
          <BacklogDetails
            project={data.project}
            backlogActivities={data.backlog.activities as any}
            backlogSprints={data.backlog.sprints as any}
            projectMembers={data.project.members as any}
          />
        )}
        {activeTab === "kanban" && (
          <ProjectKanban
            project={data.project}
            backlogSprints={data.backlog.sprints as any}
          />
        )}
      </div>
    </div>
  );
};
export default ProjectDetails;
