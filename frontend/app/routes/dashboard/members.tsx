import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetWorkspaceDetailsQuery } from "@/hooks/use-workspace";
import type { Workspace } from "@/types/app";
import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

const Members = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const workspaceId = searchParams.get("workspaceId");
  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState<string>(initialSearch);

  useEffect(() => {
    const params: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    params.search = search;

    setSearchParams(params, { replace: true });
  }, [search]);

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (urlSearch !== search) setSearch(urlSearch);
  }, [searchParams]);

  const { data, isLoading } = useGetWorkspaceDetailsQuery(workspaceId!) as {
    data: Workspace;
    isLoading: boolean;
  };

  if (isLoading)
    return (
      <div>
        <Loader />
      </div>
    );

  if (!data || !workspaceId)
    return (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon" className="w-16 h-16">
              <Users className="w-8 h-8" />
            </EmptyMedia>
            <EmptyTitle>Select a Workspace</EmptyTitle>
            <EmptyDescription>
              Choose a workspace from the header to view workspace members
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
                <BackButton/>
          </EmptyContent>
        </Empty>
    );

  const filteredMembers = data?.members?.filter(
    (member) =>
      member.user.name.toLowerCase().includes(search.toLowerCase()) ||
      member.user.email.toLowerCase().includes(search.toLowerCase()) ||
      member.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 py-4 px-2">
      <div className="flex items-start md:items-center justify-between">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Workspace Members</h1>
      </div>

      <div className="[&_input]:text-md [&_input]:max-md:text-xs [&_input]:max-sm:text-xs">
        <Input
            placeholder="Search members ...."
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
              <CardTitle>Members</CardTitle>
              <CardDescription>
                {filteredMembers?.length} members in your workspace
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="divide-y">
                {filteredMembers.map((member) => (
                  <div
                    key={member.user._id}
                    className="flex flex-col md:flex-row items-center justify-between p-4 gap-3"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="bg-gray-500">
                        <AvatarImage src={member.user.profilePicture} />
                        <AvatarFallback>
                          {member.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm sm:text-lg font-medium">{member.user.name}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {member.user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 ml-11 md:ml-0">
                      <Badge
                        variant={
                          ["admin", "owner"].includes(member.role)
                            ? "destructive"
                            : "secondary"
                        }
                        className="capitalize"
                      >
                        {member.role}
                      </Badge>

                      <Badge variant={"outline"}>{data.name}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BOARD VIEW */}
        <TabsContent value="board">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMembers.map((member) => (
              <Card key={member.user._id} className="">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <Avatar className="bg-gray-500 size-20 mb-4">
                    <AvatarImage src={member.user.profilePicture} />
                    <AvatarFallback className="uppercase">
                      {member.user.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <h3 className="text-sm sm:text-lg font-medium mb-2">
                    {member.user.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-500 mb-4 line-clamp-2 w-full max-w-[212px] overflow-hidden text-ellipsis break-all">
                    {member.user.email}
                  </p>

                  <Badge
                    variant={
                      ["admin", "owner"].includes(member.role)
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {member.role}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Members;
