import type { Workspace } from "@/types/app";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useDeleteWorkspaceMutation } from "@/hooks/use-workspace";
import { toast } from "sonner";
import { useNavigate } from "react-router";

interface DeleteWorksapceProps {
  workspace: Workspace;
}

const DeleteWorkspace = ({ workspace }: DeleteWorksapceProps) => {
  const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false);
  return (
    <div className="mt-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <h3 className="text-sm font-medium text-muted-foreground mt-2">
            Irreversible actions for your workspace
          </h3>
        </CardHeader>
        <CardContent>
          <Button
            variant={"destructive"}
            onClick={() => setIsDeletingWorkspace(true)}
          >
            Delete Workspace
          </Button>
        </CardContent>
      </Card>
      <DeleteWorkspaceDialog
        isOpen={isDeletingWorkspace}
        onOpenChange={setIsDeletingWorkspace}
        workspaceId={workspace._id}
      />
    </div>
  );
};

interface DeleteWorksapceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}

const DeleteWorkspaceDialog = ({
  isOpen,
  onOpenChange,
  workspaceId,
}: DeleteWorksapceDialogProps) => {
  const { mutate: deleteWorkspaceMutation, isPending } = useDeleteWorkspaceMutation();
  const navigate = useNavigate();

  const handleDeleteWorkspace = () => {
    deleteWorkspaceMutation(workspaceId, {
      onSuccess: () => {
        toast.success("Workspace deleted successfully");
        navigate("/workspaces");
      },
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.message || "Failed to Delete Workspace";
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
          <DialogTitle>Delete Workspace</DialogTitle>
          <h3 className="text-sm font-medium text-muted-foreground mt-2">
            This action <strong>cannot be undone</strong>. This will permanently
            delete your workspace and remove all associated data.
          </h3>
        </DialogHeader>

        <div className="w-full flex flex-row justify-center sm:justify-end gap-2">
          <Button value={"ouline"} onClick={handleCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant={"destructive"}
            onClick={handleDeleteWorkspace}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteWorkspace;
