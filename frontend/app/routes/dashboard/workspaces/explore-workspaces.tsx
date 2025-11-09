import { Loader } from "@/components/loader";
import { useGetAllWorkspacesQuery } from "@/hooks/use-workspace";
import type { Project, User, Workspace } from "@/types/app";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  ArrowUpFromLine,
  ChevronDown,
  ChevronRight,
  Search,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { WorkspaceAvatar } from "@/components/workspace/workspace-avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface WorkspaceWhitStats {
  _id: string;
  name: string;
  description?: string;
  owner: User | string;
  color: string;
  members: {
    user: User;
    role: "admin" | "member" | "owner" | "viewer";
    joinedAt: Date;
  }[];
  projects?: Project[];
  createdAt: Date;
  updatedAt: Date;
  matchingStats: {
    matchingProjects: number; //matching projects by title
    matchingTags: number; //matchinf projects by tags
  };
}

const ExploreWorkspaces = ({
  _id,
  name,
  description,
  owner,
  color,
  members,
  projects,
  createdAt,
  updatedAt,
  matchingStats,
}: WorkspaceWhitStats) => {
  function useDebounce<T>(value: T, delay: number = 1000): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  }

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 800); // Espera 800ms después de escribir

  const { data, isLoading } = useGetAllWorkspacesQuery(
    debouncedSearch || undefined
  ) as {
    data: {
      workspaces: WorkspaceWhitStats[];
    };
    isLoading: boolean;
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6 py-4 px-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2x1 font-bold">Explore Workspaces</h1>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
        <div className="[&_input]:text-md [&_input]:max-md:text-xs [&_input]:max-sm:text-xs">
          <Input
            placeholder="Search by workspace name, project name, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de workspaces */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.workspaces && data.workspaces.length > 0 ? (
          data.workspaces.map((workspace) => (
            <WorkspaceCardProjects
              key={workspace._id}
              search={search}
              workspace={workspace}
              workspaceProjects={workspace.projects || []}
              workspaceMatchingStats={workspace.matchingStats || {}}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No workspaces found</p>
          </div>
        )}
      </div>
    </div>
  );
};

const WorkspaceCardProjects = ({
  search,
  workspace,
  workspaceProjects,
  workspaceMatchingStats,
}: {
  search: string;
  workspace: WorkspaceWhitStats;
  workspaceProjects: Project[];
  workspaceMatchingStats: {
    matchingProjects: number;
    matchingTags: number;
  };
}) => {
  const [isOpenProjects, setIsOpenProjects] = useState(false);

  const matchingTagNames = useMemo(() => {
    const tags = new Set();
    if (workspaceProjects && search) {
      workspaceProjects.forEach((project) => {
        project.tags?.forEach((tag) => {
          if (tag.toLowerCase().includes(search.toLowerCase())) {
            tags.add(tag);
          }
        });
      });
    }
    return Array.from(tags);
  }, [workspaceProjects, search]);

  return (
    <Card className="transition-all hover:shadow-md hover:-translate-y-1">
      <Link to={`/workspaces/explore-workspaces/public/${workspace._id}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <WorkspaceAvatar name={workspace.name} color={workspace.color} />

              <div>
                <CardTitle>{workspace.name}</CardTitle>
                <span className="text-xs text-muted-foreground">
                  Created at {format(workspace.createdAt, "MMM d, yyyy h:mm a")}
                </span>
              </div>
            </div>

            <div className="flex items-center text-muted-foreground">
              <Users className="size-4 mr-1" />
              <span className="text-xs">{workspace.members.length}</span>
            </div>
          </div>
          <CardDescription className="line-clamp-2">
            {workspace.description || "No description"}
          </CardDescription>
        </CardHeader>
      </Link>
      <CardContent className="flex items-center justify-between">
        {workspaceProjects?.length > 0 ? (
          <div className="w-full border rounded-md shadow-sm flex items-center gap-4 px-3 py-2 hover:bg-gray-50 hover:rounded-md">
            <DropdownMenu
              open={isOpenProjects}
              onOpenChange={setIsOpenProjects}
            >
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center justify-center border rounded-md text-sm font-medium transition-colors hover:cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 p-0">
                  {isOpenProjects ? (
                    <ChevronDown size={16} className="text-gray-600" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-600" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mt-4">
                <DropdownMenuLabel>Projects</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {workspaceProjects.map((project) => (
                  <DropdownMenuItem>
                    {project.title}
                    {project.tags.map((tag) => {
                      const isMatchingTag = matchingTagNames.includes(tag);
                      return (
                        <Badge
                          key={tag}
                          variant={isMatchingTag ? "outline" : "secondary"}
                          className={
                            isMatchingTag
                              ? "border-blue-500 text-blue-700 bg-blue-50"
                              : ""
                          }
                        >
                          {tag}
                        </Badge>
                      );
                    })}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex flex-col">
              <span className="text-xs">Coincidences</span>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger>
                    <span className="text-xs text-muted-foreground">
                      {workspaceMatchingStats.matchingProjects || 0} projects
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Matching project by title</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="text-xs text-muted-foreground">
                      {workspaceMatchingStats.matchingTags || 0} tags
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Matching project by tags</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full border rounded-md bg-white shadow-sm">
            <div className="w-ful h-14 flex items-center justify-center px-2 py-2 hover:bg-gray-50 hover:rounded-md">
              <span className="text-xs text-muted-foreground text-center">
                Workspace without projects
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExploreWorkspaces;
