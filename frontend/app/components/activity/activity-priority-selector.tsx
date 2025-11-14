import type { ActivityPriority } from "@/types/app";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { toast } from "sonner";
import { useUpdateActivityPriorityMutation, useUpdateActivityStatusMutation } from "@/hooks/use-activity";


export const ActivityPrioritySelector = ({
  priority,
  activityId,
}: {
  priority: ActivityPriority ;
  activityId: string;
}) => {
    const { mutate, isPending } = useUpdateActivityPriorityMutation();

  const handlePriorityChange = (value: string) => {
    mutate(
      { activityId, priority: value as ActivityPriority },
      {
        onSuccess: () => {
          toast.success("Priority updated successfully");
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
    <Select value={priority || ""} onValueChange={handlePriorityChange}>
      <SelectTrigger className="w-[180px] mt-1" disabled={isPending}>
        <SelectValue placeholder="Priority" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="High">High</SelectItem>
        <SelectItem value="Medium">Medium</SelectItem>
        <SelectItem value="Low">Low</SelectItem>
      </SelectContent>
    </Select>
  );
};
