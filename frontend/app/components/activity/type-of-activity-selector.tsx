import { useUpdateTypeOfActivityMutation } from "@/hooks/use-activity";
import type { TypeOfActivity } from "@/types/app";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Bookmark, BoxIcon, PictureInPicture, SquareCheckBig } from "lucide-react";

const TypeOfActivitySelector = ({
  typeOf,
  activityId,
}: {
  typeOf: TypeOfActivity;
  activityId: string;
}) => {
  const { mutate, isPending } = useUpdateTypeOfActivityMutation();

  const handleTypeOfChange = (value: string) => {
    mutate(
      { activityId, typeOf: value as TypeOfActivity },
      {
        onSuccess: () => {
          toast.success("Type of activity updated successfully");
        },
        onError: (error: any) => {
          const errorMessage = error.response.data.message;
          toast.error(errorMessage);
          console.log(error);
        },
      }
    );
  };

  console.log(typeOf)

  return (
    <Select value={typeOf || ""} onValueChange={handleTypeOfChange}>
      <SelectTrigger className="w-[180px]" disabled={isPending}>
        <SelectValue placeholder="Status" />
      </SelectTrigger>

      <SelectContent>
        <Tooltip>
          <TooltipTrigger>
            <SelectItem value="Epic">
              <BoxIcon /> Epic
            </SelectItem>
          </TooltipTrigger>
          <TooltipContent>
            Epics track collections of related bugs, stories, and tasks.
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <SelectItem value="Story">
              <Bookmark /> Story
            </SelectItem>
          </TooltipTrigger>
          <TooltipContent>
            Stories track functionality or features expressed as user goals.
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <SelectItem value="Task">
              <SquareCheckBig /> Task
            </SelectItem>
          </TooltipTrigger>
          <TooltipContent>
            Tasks track small, distinct pieces of work.
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <SelectItem value="Subtask">
              <PictureInPicture /> Subtask
            </SelectItem>
          </TooltipTrigger>
          <TooltipContent>
            Subtasks track small pieces of work that are part of a larger task.
          </TooltipContent>
        </Tooltip>
      </SelectContent>
    </Select>
  );
};

export default TypeOfActivitySelector;
