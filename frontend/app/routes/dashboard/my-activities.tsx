import { Loader } from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetMyActivitiesQuery } from "@/hooks/use-activity";
import type { Activity } from "@/types/app";
import { format } from "date-fns";
import { ArrowUpRight, CheckCircle, Clock, FilterIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";


const MyActivities = () => {

  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilter = searchParams.get("filter") || "all";
  const initialSort = searchParams.get("sort") || "desc";
  const initialSearch = searchParams.get("search") || "";

  const [filter, setFilter] = useState<string>(initialFilter);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialSort === "asc" ? "asc" : "desc"
  );
  const [search, setSearch] = useState<string>(initialSearch);

  useEffect(() => {
    const params: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    params.filter = filter;
    params.sort = sortDirection;
    params.search = search;

    setSearchParams(params, { replace: true });
  }, [filter, sortDirection, search]);

  useEffect(() => {
    const urlFilter = searchParams.get("filter") || "all";
    const urlSort = searchParams.get("sort") || "desc";
    const urlSearch = searchParams.get("search") || "";

    if (urlFilter !== filter) setFilter(urlFilter);
    if (urlSort !== sortDirection)
      setSortDirection(urlSort === "asc" ? "asc" : "desc");
    if (urlSearch !== search) setSearch(urlSearch);
  }, [searchParams]);


  const { data: myActivities, isLoading } = useGetMyActivitiesQuery() as {
    data: Activity[];
    isLoading: boolean;
  };

  const filteredActivities =
    myActivities?.length > 0
      ? myActivities
          .filter((activity) => {
            if (filter === "all") return true;
            if (filter === "todo") return activity.status === "To Do";
            if (filter === "inprogress") return activity.status === "In Progress";
            if (filter === "done") return activity.status === "Done";
            if (filter === "achieved") return activity.isArchived === true;
            if (filter === "high") return activity.priority === "High";

            return true;
          })
          .filter(
            (activity) =>
              activity.title.toLowerCase().includes(search.toLowerCase()) ||
              activity.description?.toLowerCase().includes(search.toLowerCase())
          )
      : [];

    //   sort activities
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return sortDirection === "asc"
        ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
    return 0;
  });

  const todoActivities = sortedActivities.filter((activity) => activity.status === "To Do");
  const inProgressActivities = sortedActivities.filter(
    (activity) => activity.status === "In Progress"
  );
  const doneActivities = sortedActivities.filter((activity) => activity.status === "Done");


  if (isLoading)
    return (
      <div>
        <Loader/>
      </div>
  );

  return (
    <div className="space-y-6 py-4 px-2">
      <div className="flex items-start md:items-center justify-between">
        <h1 className="text-2x1 font-bold">My Activities</h1>

        <div
          className="flex flex-col items-start md:flex-row md gap-2"
        >
          <Button
            variant={"outline"}
            onClick={() =>
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }
          >
            {sortDirection === "asc" ? "Oldest First" : "Newest First"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center justify-center border rounded-md text-sm font-medium transition-colors hover:cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-20 p-0" >
                <FilterIcon className="w-4 h-4" /> Filter
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="mr-8">
              <DropdownMenuLabel>Filter Activities</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilter("all")}>
                All Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("todo")}>
                To Do
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("inprogress")}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("done")}>
                Done
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("achieved")}>
                Achieved
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("high")}>
                High
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="[&_input]:text-md [&_input]:max-md:text-xs [&_input]:max-sm:text-xs">
        <Input
          placeholder="Search tasks ...."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="board">Board View</TabsTrigger>
        </TabsList>

        {/* LIST VIEW */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>My Tasks</CardTitle>
              <CardDescription>
                {sortedActivities?.length} activities assigned to you
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="divide-y">
                {sortedActivities?.map((activity) => (
                  <div key={activity._id} className="p-4 hover:bg-muted/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-3">
                      <div className="flex">
                        <div className="flex gap-2 mr-2">
                          {activity.status === "Done" ? (
                            <CheckCircle className="size-4 text-green-500" />
                          ) : (
                            <Clock className="size-4 text-yellow-500" />
                          )}
                        </div>

                        <div>
                          <Link
                            to={`/workspaces/${activity.backlog.project.workspace}/projects/${activity.backlog.project._id}/backlog/activities/${activity._id}`}
                            className="font-medium hover:text-primary hover:underline transition-colors flex items-center"
                          >
                            {activity.title}
                            <ArrowUpRight className="size-4 ml-1" />
                          </Link>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge
                              variant={
                                activity.status === "Done" ? "default" : "outline"
                              }
                            >
                              {activity.status}
                            </Badge>

                            {activity.priority && (
                              <Badge
                                variant={
                                  activity.priority === "High"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {activity.priority}
                              </Badge>
                            )}

                            {activity.isArchived && (
                              <Badge variant={"outline"}>Archived</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        {activity.dueDate && (
                          <div>Due: {format(activity.dueDate, "PPPP")}</div>
                        )}

                        <div>
                          Project:{" "}
                          <span className="font-medium">
                            {activity.backlog.project.title}
                          </span>
                        </div>

                        <div>Modified on: {format(activity.updatedAt, "PPPP")}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {sortedActivities?.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No tasks found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BOARD VIEW */}
        <TabsContent value="board">
          <div className="grid grid-cols-1 md:grid-cols-3  gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  To Do
                  <Badge variant={"outline"}>{todoActivities?.length}</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                {todoActivities?.map((activity) => (
                  <Card
                    key={activity._id}
                    className="hover:shadow-md transition-shadow px-4"
                  >
                    <Link
                      to={`/workspaces/${activity.backlog.project.workspace}/projects/${activity.backlog.project._id}/backlog/activities/${activity._id}`}
                      className="block"
                    >
                      <h3 className="font-medium">{activity.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {activity.description || "No description "}
                      </p>

                      <div className="flex items-center mt-2 gap-2">
                        <Badge
                          variant={
                            activity.priority === "High"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {activity.priority}
                        </Badge>

                        {activity.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            {format(activity.dueDate, "PPPP")}
                          </span>
                        )}
                      </div>
                    </Link>
                  </Card>
                ))}

                {todoActivities?.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No tasks found
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  In Progress
                  <Badge variant={"outline"}>{inProgressActivities?.length}</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                {inProgressActivities?.map((activity) => (
                  <Card
                    key={activity._id}
                    className="hover:shadow-md transition-shadow px-4"
                  >
                    <Link
                      to={`/workspaces/${activity.backlog.project.workspace}/projects/${activity.backlog.project._id}/backlog/activities/${activity._id}`}
                      className="block"
                    >
                      <h3 className="font-medium">{activity.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {activity.description || "No description "}
                      </p>

                      <div className="flex items-center mt-2 gap-2">
                        <Badge
                          variant={
                            activity.priority === "High"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {activity.priority}
                        </Badge>

                        {activity.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            {format(activity.dueDate, "PPPP")}
                          </span>
                        )}
                      </div>
                    </Link>
                  </Card>
                ))}

                {inProgressActivities?.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No activities found
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Done
                  <Badge variant={"outline"}>{doneActivities?.length}</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                {doneActivities?.map((activity) => (
                  <Card
                    key={activity._id}
                    className="hover:shadow-md transition-shadow px-4"
                  >
                    <Link
                      to={`/workspaces/${activity.backlog.project.workspace}/projects/${activity.backlog.project._id}/backlog/activities/${activity._id}`}
                      className="block"
                    >
                      <h3 className="font-medium">{activity.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {activity.description || "No description "}
                      </p>

                      <div className="flex items-center mt-2 gap-2">
                        <Badge
                          variant={
                            activity.priority === "High"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {activity.priority}
                        </Badge>

                        {activity.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            {format(activity.dueDate, "PPPP")}
                          </span>
                        )}
                      </div>
                    </Link>
                  </Card>
                ))}

                {doneActivities?.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No tasks found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>

);
};

export default MyActivities;
