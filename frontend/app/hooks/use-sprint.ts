import type { UpdateStartSprintFormData } from "@/components/sprint/start-sprint-dialog";
import { fetchData, postData, updateData } from "@/lib/fetch-util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateSprintMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) =>
      postData(`/sprints/${projectId}/backlog/create-sprint`, {}),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({
        queryKey: ["project", projectId],
      });
    },
  });
};

export const useUpdateStarSprintMutation = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      sprintId: string;
      sprintData: UpdateStartSprintFormData;
    }) => updateData(`/sprints/${data.sprintId}`, data.sprintData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project", projectId],
      });
    },
  });
};

export const useAddActivityToSprintMutation = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { sprintId: string; activityId: string }) =>
      postData(`/sprints/${data.sprintId}/add-activity/${data.activityId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project", projectId],
      });
    },
  });
};

export const useAchievedSprintMutation = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { sprintId: string;}) =>
      postData(`/sprints/${data.sprintId}/achieved`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project", projectId],
      });
    },
  });
};

export const useFinishStartedSprintMutation = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { sprintId: string;}) =>
      postData(`/sprints/${data.sprintId}/finished`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project", projectId],
      });
    },
  });
};
