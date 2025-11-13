import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useNavigate } from "react-router";
import { useDeleteProjectMutation } from "@/hooks/use-project";
import { toast } from "sonner";
import type { Project } from "@/types/app";

interface DeleteProjectProps {
  project: Project;
  workspaceId: string;
}

const DeleteProject = ({ project, workspaceId }: DeleteProjectProps) => {
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  return (
    <div className="mt-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <h3 className="text-sm font-medium text-muted-foreground mt-2">
            Irreversible actions for your project
          </h3>
        </CardHeader>
        <CardContent>
          <Button
            variant={"destructive"}
            onClick={() => setIsDeletingProject(true)}
          >
            Delete Workspace
          </Button>
        </CardContent>
      </Card>
      <DeleteProjectDialog
        isOpen={isDeletingProject}
        onOpenChange={setIsDeletingProject}
        projectId={project._id}
        workspaceId={workspaceId}
      />
    </div>
  );
};

interface DeleteProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  workspaceId: string;
}

const DeleteProjectDialog = ({
  isOpen,
  onOpenChange,
  projectId,
  workspaceId,
}: DeleteProjectDialogProps) => {

    const { mutate: deleteProjectMutation, isPending } = useDeleteProjectMutation();
      const navigate = useNavigate();

      const handleDeleteProject = () => {
        deleteProjectMutation(projectId, {
          onSuccess: () => {
            toast.success("Project deleted successfully");
            navigate(`/workspaces/${workspaceId}`);
          },
          onError: (error: any) => {
            const errorMessage =
              error.response?.data?.message || "Failed to Delete Project";
            toast.error(errorMessage);
          },
        });
      };

      const handleCancel = () => {
        onOpenChange(false);
      };

    return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <h3 className="text-sm font-medium text-muted-foreground mt-2">
            This action <strong>cannot be undone</strong>. This will permanently
            delete your project and remove all associated data.
          </h3>
        </DialogHeader>

        <div className="w-full flex flex-row justify-center sm:justify-end gap-2">
          <Button value={"ouline"} onClick={handleCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant={"destructive"}
            onClick={handleDeleteProject}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    );
}

export default DeleteProject