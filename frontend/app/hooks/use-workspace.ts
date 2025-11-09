import type { WorkspaceForm } from "@/components/workspace/create-workspace";
import { fetchData, postData } from "@/lib/fetch-util";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useCreateWorkspace = () => {
  return useMutation({
    mutationFn: async (data: WorkspaceForm) => postData("/workspaces", data),
  });
};

export const useGetWorkspacesQuery = () => {
  return useQuery ({
    queryKey: ['workspaces'],
    queryFn: async () => fetchData('/workspaces'),
  });
};

export const useGetWorkspaceQuery = (workspaceId: string) => {
  return useQuery ({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}/projects`),
  });
};

export const useGetAllWorkspacesQuery = (search?: string) => {
  return useQuery({
    queryKey: ['workspaces', 'explore', search],
    queryFn: async () => {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      return fetchData(`/workspaces/explore-workspaces${params}`);
    },
  });
};

export const useGetPublicWorkspaceProjectsQuery = (workspaceId: string) => {
  return useQuery ({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => fetchData(`/workspaces/explore-workspaces/public/${workspaceId}/projects`),
  });
};


export const useGetWorkspaceStatsQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ['workspace', workspaceId, 'stats'],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}/stats`),
    enabled: !!workspaceId
  })
}

export const useGetPublicWorkspaceDetailsQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "details"],
    queryFn: async () => fetchData(`/workspaces/explore-workspaces/public/${workspaceId}`),
  });
};


export const useGetWorkspaceDetailsQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "details"],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}`),
  });
};

export const useInviteMemberMutation = () => {
  return useMutation({
    mutationFn: (data: { email: string; role: string; workspaceId: string }) =>
      postData(`/workspaces/${data.workspaceId}/invite-member`, data),
  });
};

export const useAcceptInviteByTokenMutation = () => {
  return useMutation({
    mutationFn: (token: string) =>
      postData(`/workspaces/accept-invite-token`, {
        token,
      }),
  });
};

export const useAcceptGenerateInviteMutation = () => {
  return useMutation({
    mutationFn: (workspaceId: string) =>
      postData(`/workspaces/${workspaceId}/accept-generate-invite`, {}),
  });
};

export const useJoinRequestMutation = () => {
  return useMutation({
    mutationFn: (workspaceId: string) =>
      postData(`/workspaces/explore-workspaces/public/${workspaceId}/join-request`, {}),
  });
};

export const useAcceptJoinRequestByTokenMutation = () => {
  return useMutation({
    mutationFn: (token: string) =>
      postData(`/workspaces/accept-join-request-token`, {
        token,
      }),
  });
};

export const useRejectJoinRequestByTokenMutation = () => {
  return useMutation({
    mutationFn: (data: { token: string; reason: string }) =>
      postData(`/workspaces/reject-join-request-token`, data),
  });
};

export const useGetPendingJoinRequestsQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ['workspace-join-requests', workspaceId],
    queryFn: async () =>
      fetchData(`/workspaces/${workspaceId}/join-requests`),
    enabled: !!workspaceId, // Solo ejecutar si workspaceId existe
  });
};

export const useGetPendingJoinRequestQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ['workspace-join-requests', workspaceId],
    queryFn: async () =>
      fetchData(`/workspaces/${workspaceId}/join-request`),
    enabled: !!workspaceId, // Solo ejecutar si workspaceId existe
  });
};