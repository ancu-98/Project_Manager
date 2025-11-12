import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTransferWorkspaceOwnerMutation } from "@/hooks/use-workspace";
import type { MembersProps, Workspace } from "@/types/app";
import { AvatarImage } from "@radix-ui/react-avatar";
import { DialogTitle } from "@radix-ui/react-dialog";
import { CheckCircle2, CircleDot } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TransferWorkspaceOwnerProps {
  workspace: Workspace;
}

const TransferWorkspaceOwner = ({ workspace }: TransferWorkspaceOwnerProps) => {
  const [isTransferOwner, setIsTransferOwner] = useState(false);

  return (
    <div className="mt-2">
      <Card>
        <CardHeader>
          <CardTitle>Transfer Workspace</CardTitle>
          <h3 className="text-sm font-medium text-muted-foreground mt-2">
            Transfer ownership of this workspace to another member
          </h3>
        </CardHeader>
        <CardContent>
          <Button variant={"outline"} onClick={() => setIsTransferOwner(true)}>
            Transfer Workspace
          </Button>
        </CardContent>
      </Card>
      <TransferOwnerDialog
        isOpen={isTransferOwner}
        onOpenChange={setIsTransferOwner}
        workspaceMembers={workspace.members as any}
        workspaceId={workspace._id}
      />
    </div>
  );
};

interface TranserOwnerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceMembers: MembersProps[];
  workspaceId: string;
}

const TransferOwnerDialog = ({
  isOpen,
  onOpenChange,
  workspaceMembers,
  workspaceId,
}: TranserOwnerDialogProps) => {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const { mutate: transferOwnership, isPending } =
    useTransferWorkspaceOwnerMutation(workspaceId);

  // Filtrar miembros que no son el owner actual (para no permitir transferir a uno mismo)
  const availableMembers = workspaceMembers.filter(
    (member) => member.role !== "owner"
  );

  const handleTransfer = () => {
    if (!selectedMember) {
      toast.error("Please select a member to transfer ownership");
      return;
    }

    transferOwnership(selectedMember, {
      onSuccess: () => {
        toast.success("Workspace ownership transferred successfully");
        onOpenChange(false);
        setSelectedMember(null);
      },
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.message || "Failed to transfer ownership";
        toast.error(errorMessage);
      },
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedMember(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>Transfer Workspace Ownership</DialogTitle>
          <h3 className="text-sm font-medium text-muted-foreground mt-2">
            Select a member to transfer ownership of this workspace. This action
            cannot be undone.
          </h3>
        </DialogHeader>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {availableMembers.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No members available for ownership transfer
            </div>
          ) : (
            availableMembers.map((member) => (
              <div
                key={member.user._id}
                className="w-full"
                onClick={() => setSelectedMember(member.user._id)}
              >
                <Item
                  variant={
                    selectedMember === member.user._id ? "outline" : "default"
                  }
                  className={`cursor-pointer transition-all ${
                    selectedMember === member.user._id
                      ? "border-blue-500 bg-blue-50"
                      : "hover:bg-accent"
                  }`}
                >
                  <ItemMedia>
                    <Avatar className="size-10">
                      <AvatarImage src={member.user.profilePicture} />
                      <AvatarFallback>
                        {member.user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="flex items-center gap-2">
                      {member.user.name}
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-xs font-normal px-2 py-1 bg-muted rounded-full">
                            {member.role}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>member role</TooltipContent>
                      </Tooltip>
                    </ItemTitle>
                    <ItemDescription>{member.user.email}</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button
                      size="icon-sm"
                      variant={
                        selectedMember === member.user._id
                          ? "default"
                          : "outline"
                      }
                      className={`rounded-full ${
                        selectedMember === member.user._id
                          ? "bg-blue-500 text-white"
                          : ""
                      }`}
                      aria-label="Select member"
                    >
                      {selectedMember === member.user._id ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <CircleDot className="h-4 w-4" />
                      )}
                    </Button>
                  </ItemActions>
                </Item>
              </div>
            ))
          )}
        </div>

        <div className="w-full flex flex-row justify-center sm:justify-end gap-2">
          <Button value={"ouline"} onClick={handleCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant={"destructive"}
            onClick={handleTransfer}
            disabled={!selectedMember || isPending}
          >
            {isPending ? "Transferring..." : "Transfer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransferWorkspaceOwner;
