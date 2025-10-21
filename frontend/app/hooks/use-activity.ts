import type { CreateActivityFormData } from "@/components/activity/create-activity-dialog";
import { postData } from "@/lib/fetch-util";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateActivityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      projectId: string;
      activityData: CreateActivityFormData
    }) =>
        postData(`/activities/${data.projectId}/backlog/create-activity`, data.activityData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["project", variables.projectId],
      });
    },
  });
};



