import type { CreateProjectFormData } from "@/components/project/create-project";
import type { UpdateProjectFormData } from "@/components/project/update-project";
import { deleteData, fetchData, postData, updateData } from "@/lib/fetch-util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const UseCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      projectData: CreateProjectFormData;
      workspaceId: string;
    }) =>
      postData(
        `/projects/${data.workspaceId}/create-project`,
        data.projectData
      ),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", data.workspace],
      });
    },
  });
};

export const useGetProjectBacklogDetailsQuery = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchData(`/projects/${projectId}/backlog`)
  })
}

export const useProjectBacklogActivitiesQuery = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchData(`/projects/${projectId}/backlog/activities`)
  })
}

export const useReturnSprintActivitytoProjectBacklogMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      projectId: string;
      activityId: string;
    }) =>
      postData(
        `/projects/${data.projectId}/backlog/return-activity/${data.activityId}`,
        {}
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["project", variables.projectId],
      });
    },
  });
};

export const useUpdateProjectMutation = (projectId: string) => {
   const queryClient = useQueryClient();

   return useMutation({
    mutationFn: (data: {
      projectId: string;
      projectData: UpdateProjectFormData;
    }) => updateData(`projects/${data.projectId}/backlog/update-project`, data.projectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId]}),
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
   })
}

export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) =>
      deleteData(`/projects/${projectId}/backlog/delete-project`),
    onSuccess: () => {
      // Invalidar todas las queries relacionadas con projects
      queryClient.invalidateQueries({
        queryKey: ['projects']
      });
      queryClient.invalidateQueries({
        queryKey: ['project']
      });
    },
  });
};