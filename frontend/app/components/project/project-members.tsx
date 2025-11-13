import type { ProjectMemberRole, User } from "@/types/app";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";

interface ProjectMembersListProps {
  projectMembers: {
    user: User;
    role: ProjectMemberRole;
  }[];
}

const ProjectMembersList = ({ projectMembers }: ProjectMembersListProps) => {
  return (
    <Card className="mt-2">
      <CardHeader>
        <CardTitle className="pt-1">Project Members</CardTitle>
        <h3 className="text-sm font-medium text-muted-foreground mt-2">
          List of all members in this project.
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {projectMembers.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No members on this project.
            </div>
          ) : (
            projectMembers.map((member) => (
              <div
                key={member.user._id}
                className="flex flex-col md:flex-row items-center justify-between p-4 gap-3"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="bg-gray-500">
                    <AvatarImage src={member.user.profilePicture} />
                    <AvatarFallback>
                      {member.user.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs sm:text-sm font-medium">
                    {member.user.name}
                  </p>
                </div>

                <div className="flex items-center space-x-1 ml-11 md:ml-0">
                  <Badge
                    variant={
                      ["manager", "contributor"].includes(member.role)
                        ? "destructive"
                        : "secondary"
                    }
                    className="capitalize"
                  >
                    {member.role}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectMembersList;
