import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { WorkspaceAvatar } from "@/components/workspace/workspace-avatar";
import {
  useAcceptJoinRequestByTokenMutation,
  useRejectJoinRequestByTokenMutation,
  useGetWorkspaceDetailsQuery,
} from "@/hooks/use-workspace";
import { rejectJoinRequestSchema } from "@/lib/schema";
import type { Workspace, WorkspaceJoinRequest } from "@/types/app";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const WorkspaceJoinRequest = () => {
  const { workspaceId } = useParams();

  const [searchParams] = useSearchParams();

  const token = searchParams.get("tk");

  const navigate = useNavigate();

  if (!workspaceId) {
    return <div>Workspace not found</div>;
  }

  // Obtener workspace por Id
  const { data: workspace, isLoading } = useGetWorkspaceDetailsQuery(
    workspaceId!
  ) as { data: Workspace; isLoading: boolean };

  const { mutate: acceptJoinRequest, isPending: isAcceptJoinRequestPending } =
    useAcceptJoinRequestByTokenMutation();

  const handleAcceptJoinRequest = () => {
    if (!workspaceId) return;

    if (!token) {
      toast.error("Invalid token");
      return;
    } else {
      acceptJoinRequest(token, {
        onSuccess: () => {
          toast.success("Join Request accepted");
          navigate(`/workspaces/${workspaceId}`);
        },
        onError: (error: any) => {
          toast.error(error.response.data.message);
          console.log(error);
        },
      });
    }
  };

  const [isOpenRejectReason, setIsOpenRejectReason] = useState(false);

  if (isLoading) {
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This workspace invitation is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/workspaces")} className="w-full">
              Go to Workspaces
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <WorkspaceAvatar name={workspace.name} color={workspace.color} />
            <CardTitle>{workspace.name}</CardTitle>
          </div>
          <CardDescription>
            A user have been request join to "<strong>{workspace.name}</strong>"
            workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {workspace.description && (
            <p className="text-sm text-muted-foreground">
              {workspace.description}
            </p>
          )}
          <div className="flex gap-3">
            <Button
              variant="default"
              className="flex-1"
              onClick={() => handleAcceptJoinRequest()}
              disabled={isAcceptJoinRequestPending}
            >
              {isAcceptJoinRequestPending ? "Joining..." : "Accept Join"}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpenRejectReason(true)}
            >
              Reject Join
            </Button>
          </div>
        </CardContent>
      </Card>
      <RejectReasonDialog
        isOpen={isOpenRejectReason}
        onOpenChange={setIsOpenRejectReason}
        workspaceId={workspaceId}
        token={token as string}
      />
    </div>
  );
};

interface rejectReasonProp {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  token: string;
}

export type RejectReasonFormData = z.infer<typeof rejectJoinRequestSchema>;

const RejectReasonDialog = ({
  isOpen,
  onOpenChange,
  workspaceId,
  token,
}: rejectReasonProp) => {
  const form = useForm<RejectReasonFormData>({
    resolver: zodResolver(rejectJoinRequestSchema),
    defaultValues: {
      reason: "",
    },
  });

  const navigate = useNavigate();

  const { mutate: rejectJoinRequest, isPending: isRejectJoinRequestPending } =
    useRejectJoinRequestByTokenMutation();

  const handleSubmitRejectJoinRequest = async (values: RejectReasonFormData) => {
    if (!workspaceId) return;

    if (!token) {
      toast.error("Invalid token");
      return;
    } else {
      rejectJoinRequest(
        {
          token,
          reason: values.reason
        },
        {
          onSuccess: () => {
            toast.success("Join Request rejected");
            navigate(`/workspaces`);
          },
          onError: (error: any) => {
            toast.error(error.response.data.message);
            console.log(error);
          },
        }
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
      <DialogHeader>
        <DialogTitle>Reject Join Request</DialogTitle>
      </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmitRejectJoinRequest)}
            className="space-y-6"
          >
            <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter reazon to reject user" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            <DialogFooter>
              <Button
                type="submit"
                className="mt-6 w-full"
                size={"lg"}
                disabled={isRejectJoinRequestPending}
              >
                {isRejectJoinRequestPending ? "Rejecting..." : "Send Reason"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default WorkspaceJoinRequest;
