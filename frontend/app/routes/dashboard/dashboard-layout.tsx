import { Header } from '@/components/layout/header';
import { SideBarComponent } from '@/components/layout/sidebar-component';
import { Loader } from '@/components/loader';
import { CreateWorkspace } from '@/components/workspace/create-workspace';
import { useAuth } from '@/provider/auth.context';
import type { Workspace } from '@/types/app';
import React, { useState } from 'react'
import { Navigate, Outlet } from 'react-router';

const DashboardLayout = () => {
    const { isAuthenticated, isLoading} = useAuth();

    const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
      null
    );

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
          <div className='mx-aut container px-2 sm:px-6 lg:px-8 py-0 md:py-8 w-full h-full' >
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