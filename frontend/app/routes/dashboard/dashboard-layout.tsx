import { Header } from '@/components/layout/header';
import { SideBarComponent } from '@/components/layout/sidebar-component';
import { Loader } from '@/components/loader';
import { CreateWorkspace } from '@/components/workspace/create-workspace';
import { fetchData } from '@/lib/fetch-util';
import { useAuth } from '@/provider/auth.context';
import type { Workspace } from '@/types/app';
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLoaderData } from 'react-router';

export const clientLoader = async() => {
  try {
    const [ workspaces ] = await Promise.all([fetchData('/workspaces')]);
    return { workspaces };

  } catch (error) {
    console.log(error)
  }
};

const DashboardLayout = () => {
    const { isAuthenticated, isLoading} = useAuth();
    // Obtener workspaces del Loader
    const { workspaces } = useLoaderData() as {workspaces: Workspace[]}

    const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
      null
    );

    useEffect(() => {
      if(currentWorkspace && workspaces) {
        // Buscar el workspace actualizado en la lista de workspaces
        const updatedWorkspace = workspaces.find(ws => ws._id === currentWorkspace._id);
        if (updatedWorkspace &&
            (updatedWorkspace.name !== currentWorkspace.name ||
             updatedWorkspace.color !== currentWorkspace.color)) {
          setCurrentWorkspace(updatedWorkspace);
        }
      }
    }, [workspaces, currentWorkspace])

    if (isLoading) {
      return <Loader />;
    }

    if (!isAuthenticated){
      return <Navigate to='/sign-in'/>;
    }

    const handleWorkspaceSelected = (workspace: Workspace) => {
      setCurrentWorkspace(workspace);
    }

  return (
    <div className='flex h-screen w-full'>

      <SideBarComponent currentWorkspace={currentWorkspace} />

      <div className='flex flex-1 flex-col h-full' >

        <Header
          onWorkspaceSelected={handleWorkspaceSelected}
          selectedWorkspace={currentWorkspace}
          onCreateWorkSpace={() =>setIsCreatingWorkspace(true)}
        />

        <main className='flex-1 overflow-y-auto h-full w-full' >
          <div className='mx-auto container px-2 sm:px-6 lg:px-8 py-0 md:py-8 w-full h-full' >
            <Outlet/>
          </div>
        </main>
      </div>

      <CreateWorkspace
        isCreatingWorkspace ={isCreatingWorkspace}
        setIsCreatingWorkspace={setIsCreatingWorkspace}
      />
    </div>
  )
}

export default DashboardLayout ;