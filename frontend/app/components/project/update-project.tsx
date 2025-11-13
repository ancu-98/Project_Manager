import { ProjectStatus, type Project } from "@/types/app";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { updateProjectSchema } from "@/lib/schema";
import type z from "zod";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BackButton } from "../back-button";
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
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { useUpdateProjectMutation } from "@/hooks/use-project";
import { toast } from "sonner";
import { useRevalidator } from "react-router";
import { useEffect } from "react";
import { Button } from "../ui/button";

interface UpdateProjectProps {
  project: Project;
}

export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;

const UpdateProject = ({ project }: UpdateProjectProps) => {
  // Convertir fechas a formato YYYY-MM-DD para inputs de tipo date
  const formatDateForInput = (
    date: Date | string | null | undefined
  ): string => {
    if (!date) return "";
    try {
      return format(new Date(date), "yyyy-MM-dd");
    } catch (error) {
      return "";
    }
  };

  const parseDateFromInput = (dateString: string): Date | null => {
    if (!dateString) return null;
    return new Date(dateString);
  };

  const form = useForm<UpdateProjectFormData>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      title: project.title,
      description: project.description,
      status: project.status,
      startDate: formatDateForInput(project.startDate),
      dueDate: formatDateForInput(project.dueDate),
      tags: project.tags,
    },
  });

  //Resetear el formulario cuando el workspace cambie
  useEffect(() => {
    form.reset({
      title: project.title,
      description: project.description,
      status: project.status,
      startDate: formatDateForInput(project.startDate),
      dueDate: formatDateForInput(project.dueDate),
      tags: project.tags,
    });
  }, [project, form]); // Dependencias: se ejecuta cuando workspace cambie

  // Hook para revalidar loaders -> En especial el del dashboard header
  const revalidator = useRevalidator();

  const { mutate, isPending } = useUpdateProjectMutation(project._id);

  const onSubmit = (values: UpdateProjectFormData) => {
    mutate(
      {
        projectId: project._id,
        projectData: values,
      },
      {
        onSuccess: () => {
          toast.success("Project updated Succesfully");
          form.reset();
          revalidator.revalidate();
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
    <Card>
      <CardHeader>
        <BackButton />
        <CardTitle className="pt-1">Project Settings</CardTitle>
        <h3 className="text-sm font-medium text-muted-foreground mt-2">
          Update your project details or delete the project
        </h3>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Project Title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Project Description"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Status</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Project Status" />
                      </SelectTrigger>

                      <SelectContent>
                        {Object.values(ProjectStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
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
                              field.onChange(date?.toISOString() || undefined);
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
                              field.onChange(date?.toISOString() || undefined);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tags - Place the project technologies here
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Tags separated by coma" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="w-full flex flex-row justify-center sm:justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UpdateProject;
