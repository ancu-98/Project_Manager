import type { Activity, Backlog, Project } from "@/types/app";


interface ProjectSummaryProps {
  project: Project;
  backlog: Backlog;
}

const ProjectSummary = ({
  project,
  backlog,
}: ProjectSummaryProps) => {

  return (
    <div>
      Project Summary
    </div>
  )
}

export default ProjectSummary;