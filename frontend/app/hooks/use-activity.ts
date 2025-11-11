import type { CreateActivityFormData } from "@/components/activity/create-activity-dialog";
import { fetchData, postData, updateData } from "@/lib/fetch-util";
import type { ActivityPriority, ActivityStatus } from "@/types/app";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateActivityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      projectId: string;
      activityData: CreateActivityFormData;
    }) =>
      postData(
        `/activities/${data.projectId}/backlog/create-activity`,
        data.activityData
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["project", variables.projectId],
      });
    },
  });
};

export const useGetActivityByIdQuery = (activityId: string) => {
  return useQuery({
    queryKey: ["activity", activityId],
    queryFn: () => fetchData(`/activities/${activityId}`),
  });
};

export const useUpdateActivityTitleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { activityId: string; title: string }) =>
      updateData(`/activities/${data.activityId}/title`, { title: data.title }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["activity", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["activity-history", data._id],
      });
    },
  });
};

export const useUpdateActivityDescriptionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { activityId: string; description: string }) =>
      updateData(`/activities/${data.activityId}/description`, {
        description: data.description,
      }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["activity", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["activity-history", data._id],
      });
    },
  });
};

export const useUpdateActivityStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { activityId: string; status: ActivityStatus }) =>
      updateData(`/activities/${data.activityId}/status`, {
        status: data.status,
      }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["activity", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["activity-history", data._id],
      });
    },
  });
};

export const useUpdateActivityAssigneesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { activityId: string; assignees: string[] }) =>
      updateData(`/activities/${data.activityId}/assignees`, {
        assignees: data.assignees,
      }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["activity", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["activity-history", data._id],
      });
    },
  });
};

export const useUpdateActivityPriorityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { activityId: string; priority: ActivityPriority }) =>
      updateData(`/activities/${data.activityId}/priority`, {
        priority: data.priority,
      }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["activity", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["activity-history", data._id],
      });
    },
  });
};

export const useAddSubTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { activityId: string; title: string }) =>
      postData(`/activities/${data.activityId}/add-subtask`, {
        title: data.title,
      }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["activity", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["activity-history", data._id],
      });
    },
  });
};

export const useUpdateSubTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      activityId: string;
      subTaskId: string;
      completed: boolean;
    }) =>
      updateData(
        `/activities/${data.activityId}/update-subtask/${data.subTaskId}`,
        { completed: data.completed }
      ),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["activity", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["activity-history", data._id],
      });
    },
  });
};

export const useAddCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { activityId: string; text: string}) =>
      postData( `/activities/${data.activityId}/add-comment`, { text: data.text }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", data.activity],
      });
      queryClient.invalidateQueries({
        queryKey: ["activity-history", data.activity],
      });
    },
  });
}

export const useGetCommentsActivityByIdQuery = (activityId: string) => {
  return useQuery({
    queryKey: ["comments", activityId],
    queryFn: () => fetchData(`/activities/${activityId}/comments`),
  });
};

export const useWatchActivityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { activityId: string;}) =>
      postData( `/activities/${data.activityId}/watch`, {}),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["activity", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["activity-history", data._id],
      });
    },
  });
}

export const useAchievedActivityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { activityId: string;}) =>
      postData( `/activities/${data.activityId}/achieved`, {}),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["activity", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["activity-history", data._id],
      });
    },
  });
}

export const useGetMyActivitiesQuery = () => {
  return useQuery({
    queryKey: ['my-activities', 'user'],
    queryFn: () => fetchData('/activities/my-activities'),
  })
}
