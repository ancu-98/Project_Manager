// En el video este archivo es: components/task-create-task-dialog.tsx
import { useCreateActivityMutation } from "@/hooks/use-activity";
import { createActivitySchema } from "@/lib/schema";
import { TypeOfActivity, type ProjectMemberRole, type User } from "@/types/app";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Bookmark, BoxIcon, CalendarIcon, PictureInPicture, SquareCheckBig } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import { Checkbox } from "../ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface CreateActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectMembers: {
    user: User;
    role: ProjectMemberRole;
  }[];
}

export type CreateActivityFormData = z.infer<typeof createActivitySchema>;

export const CreateActivityDialog = ({
  open,
  onOpenChange,
  projectId,
  projectMembers,
}: CreateActivityDialogProps) => {
  const form = useForm<CreateActivityFormData>({
    resolver: zodResolver(createActivitySchema),
    defaultValues: {
      typeOf: TypeOfActivity.TASK,
      title: "",
      description: "",
      status: "To Do",
      priority: "Medium",
      dueDate: "",
      assignees: [],
    },
  });


  const { mutate, isPending } = useCreateActivityMutation();

  const onSubmit = (values: CreateActivityFormData) => {
    mutate(
      {
        projectId,
        activityData: values,
      },
      {
        onSuccess: () => {
          toast.success("Activity created succesfully");
          form.reset();
          onOpenChange(false);
        },
        onError: (error: any) => {
          const errorMessage = error.response.data.message;
          toast.error(errorMessage);
          console.log(error);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Activity</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter activity title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="typeOf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormItem>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                              </FormControl>

                              <SelectContent>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <SelectItem value="Epic"><BoxIcon/> Epic</SelectItem>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Epics track collections of related bugs, stories, and tasks.
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <SelectItem value="Story"><Bookmark/> Story</SelectItem>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Stories track functionality or features expressed as user goals.
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <SelectItem value="Task"><SquareCheckBig/> Task</SelectItem>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Tasks track small, distinct pieces of work.
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <SelectItem value="Subtask"><PictureInPicture/> Subtask</SelectItem>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Subtasks track small pieces of work that are part of a larger task.
                                  </TooltipContent>
                                </Tooltip>
                              </SelectContent>
                            </FormItem>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter activity description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormItem>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>

                              <SelectContent>
                                <SelectItem value="To Do">To Do</SelectItem>
                                <SelectItem value="In Progress">
                                  In Progress
                                </SelectItem>
                                <SelectItem value="Done">Done</SelectItem>
                              </SelectContent>
                            </FormItem>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormItem>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>

                              <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                              </SelectContent>
                            </FormItem>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Popover modal={true}>
                          <PopoverTrigger asChild>
                            <button
                              // variant={'outline'}
                              className={
                                "flex flex-row items-center w-full h-8 px-4 py-2 text-xs font-medium border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground" +
                                (!field.value ? "text-muted-foreground" : "")
                              }
                            >
                              <CalendarIcon className="size-4 mr-2" />
                              {field.value ? (
                                format(new Date(field.value), "PPPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </button>
                          </PopoverTrigger>

                          <PopoverContent>
                            <Calendar
                              mode="single"
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(date) => {
                                field.onChange(
                                  date?.toISOString() || undefined
                                );
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignees"
                  render={({ field }) => {
                    const selectedMembers = field.value || [];

                    return (
                      <FormItem>
                        <FormLabel>Assignees</FormLabel>
                        <FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="w-full h-10 px-4 py-2 text-sm text-start font-medium border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground">
                                {selectedMembers.length === 0 ? (
                                  <span className="text-muted-foreground">
                                    Select assignees
                                  </span>
                                ) : selectedMembers.length <= 2 ? (
                                  selectedMembers
                                    .map((m) => {
                                      const member = projectMembers.find(
                                        (wm) => wm.user._id === m
                                      );

                                      return `${member?.user.name}`;
                                    })
                                    .join(", ")
                                ) : (
                                  `${selectedMembers.length} assignees selected`
                                )}
                              </button>
                            </PopoverTrigger>

                            <PopoverContent
                              className="w-full max-w-60 overflow-y-auto"
                              align="start"
                            >
                              <div className="flex flex-col gap-2">
                                {projectMembers.map((member) => {
                                  const selectedMember = selectedMembers.find(
                                    (m) => m === member.user?._id
                                  );
                                  return (
                                    <div
                                      key={member.user._id}
                                      className="flex items-center gap-2 p-2 border rounded"
                                    >
                                      <Checkbox
                                        checked={!!selectedMember}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            field.onChange([
                                              ...selectedMembers,
                                              member.user._id,
                                            ]);
                                          } else {
                                            field.onChange(
                                              selectedMembers.filter(
                                                (m) => m !== member.user._id
                                              )
                                            );
                                          }
                                        }}
                                        id={`member-${member.user._id}`}
                                      />
                                      <span className="truncate flex-1">
                                        {member.user.name}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Activity"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
