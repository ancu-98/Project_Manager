import type { ActivityStatus } from "@/types/app";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { toast } from "sonner";
import { useUpdateActivityStatusMutation } from "@/hooks/use-activity";


export const ActivityStatusSelector = ({
  status,
  activityId,
}: {
  status: ActivityStatus;
  activityId: string;
}) => {
    const { mutate, isPending } = useUpdateActivityStatusMutation();

  const handleStatusChange = (value: string) => {
    mutate(
      { activityId, status: value as ActivityStatus },
      {
        onSuccess: () => {
          toast.success("Status updated successfully");
        },
        onError: (error: any) => {
          const errorMessage = error.response.data.message;
          toast.error(errorMessage);
          console.log(error);
        },
      }
    );
  };

  return (
    <Select value={status || ""} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[180px]" disabled={isPending}>
        <SelectValue placeholder="Status" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="To Do">To Do</SelectItem>
        <SelectItem value="In Progress">In Progress</SelectItem>
        <SelectItem value="Done">Done</SelectItem>
      </SelectContent>
    </Select>
  );
};
