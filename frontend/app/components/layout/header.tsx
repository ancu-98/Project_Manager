import { useAuth } from "@/provider/auth.context";
import type { Workspace } from "@/types/app";
import { Button } from "../ui/button";
import { Bell, PlusCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Link, useLoaderData, useLocation, useNavigate } from "react-router";
import { WorkspaceAvatar } from "../workspace/workspace-avatar";

interface HeaderProps {
  onWorkspaceSelected: (workspace: Workspace) => void;
  selectedWorkspace: Workspace | null;
  onCreateWorkSpace: () => void;
}

export const Header = ({
  onWorkspaceSelected,
  selectedWorkspace,
  onCreateWorkSpace,
}: HeaderProps) => {
    const navigate = useNavigate();

    const { user, logout } = useAuth();
    const { workspaces } = useLoaderData() as { workspaces: Workspace[] };
    const inOnWorkspacePage = useLocation().pathname.includes('/workspace');

    const handleOnClick = (workspace: Workspace) => {
        onWorkspaceSelected(workspace);
        const location = window.location;

        if (inOnWorkspacePage) {
            navigate(`/workspaces/${workspace._id}`);
        } else {
            const basePath = location.pathname;
            navigate(`${basePath}?workspaceId=${workspace._id}`);
        }
    }

  return (
    <div className="bg-blackground sticky top-0 z-40 border-b" >
        <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 py-4" >
            <DropdownMenu >

                <DropdownMenuTrigger asChild>
                    <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer gap-2" >
                        {
                            selectedWorkspace ? (
                            <>
                                {
                                    selectedWorkspace.color && (
                                    <WorkspaceAvatar
                                        color={selectedWorkspace.color}
                                        name={selectedWorkspace.name}
                                    />)
                                }
                                <span className="font-medium">{selectedWorkspace?.name}</span>
                            </>
                            ) : (
                                <span className="font-medium">Select Workspace</span>
                            )
                        }

                    </button>

                </DropdownMenuTrigger>

                <DropdownMenuContent >
                    <DropdownMenuLabel>Workspace</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        {
                            workspaces.map((ws) => (
                                <DropdownMenuItem
                                    key={ws._id}
                                    onClick={() => handleOnClick(ws)}
                                >
                                    {
                                    ws.color && (
                                        <WorkspaceAvatar color={ws.color} name={ws.name} />
                                    )}
                                    <span className="ml-2" >{ws.name}</span>
                                </DropdownMenuItem>
                            ))
                        }
                    </DropdownMenuGroup>

                    <DropdownMenuGroup >
                        <DropdownMenuItem onClick={onCreateWorkSpace} >
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Create Workspace
                        </DropdownMenuItem>
                    </DropdownMenuGroup>

                </DropdownMenuContent>

            </DropdownMenu>

            <div className="flex items-center gap-2" >
                <Button variant='ghost' size='icon' >
                    <Bell />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="rounded-full border p-1 w-8 h-8" >
                            <Avatar className="w-8 h-8" >
                                <AvatarImage src={user?.profilePicture} alt={user?.name}/>
                                <AvatarFallback className="bg-black text-white" >
                                    {user?.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>

                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" >
                        <DropdownMenuLabel>My account</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem>
                            <Link to='/user/profile'>Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={logout} >
                            Log Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>

                </DropdownMenu>
            </div>
        </div>
    </div>
  );
};
