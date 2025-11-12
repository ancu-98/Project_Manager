import type { Workspace } from "@/types/app";
import { updateWorkspaceSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type z from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";
import { useUpdateWorkspaceMutation } from "@/hooks/use-workspace";
import { toast } from "sonner";
import { Settings } from "lucide-react";
import { useEffect } from "react";
import { useRevalidator } from "react-router";

interface UpdateWorkspaceProps {
  workspace: Workspace;
}

export const colorOptions = [
  "#FF5733", // Red-Orange
  "#33C1FF", // Blue
  "#28A745", // Green
  "#FFC300", // Yellow
  "#8E44AD", // Purple
  "#E67E22", // Orange
  "#2ECC71", // Light Green
  "#34495E", // Navy
];

export type UpdateWorkspaceFormData = z.infer<typeof updateWorkspaceSchema>;

const UpdateWorkspace = ({ workspace }: UpdateWorkspaceProps) => {
  const form = useForm<UpdateWorkspaceFormData>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      name: workspace.name,
      color: workspace.color,
      description: workspace.description,
    },
  });

  //Resetear el formulario cuando el workspace cambie
  useEffect(() => {
    form.reset({
      name: workspace.name,
      color: workspace.color,
      description: workspace.description,
    });
  }, [workspace, form]); // Dependencias: se ejecuta cuando workspace cambie

  // Hook para revalidar loaders -> En especial el del dashboard header
  const revalidator = useRevalidator();

  const { mutate, isPending } = useUpdateWorkspaceMutation(workspace._id);

  const onSubmit = (values: UpdateWorkspaceFormData) => {
    mutate(
      {
        workspaceId: workspace._id,
        workspaceData: values,
      },
      {
        onSuccess: () => {
          toast.success("Workspace updated Succesfully");
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
        <div className="flex flex-col">
          <div className="flex flex-row aling-center gap-2">
            <Settings className="size-6" />
            <CardTitle className="pt-1">Workspace Settings</CardTitle>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mt-2">
            Manage you workspace settings and preferences
          </h3>
        </div>
      </CardHeader>
      <CardContent className="max-h-[80vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <div className="[&_input]:text-md [&_input]:max-md:text-xs [&_input]:max-sm:text-xs">
                      <FormControl>
                        <Input {...field} placeholder="Workspace Name" />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <div className="[&_textarea]:text-md [&_textarea]:max-md:text-xs [&_textarea]:max-sm:text-xs">
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Workspace Description"
                          rows={3}
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <div className="flex gap-3 flex-wrap">
                        {colorOptions.map((color) => (
                          <div
                            key={color}
                            onClick={() => field.onChange(color)}
                            className={cn(
                              "w-6 h-6 rounded-full cursor-pointer hover:opacity-80 transition-all duration-300",
                              field.value === color &&
                                "ring-2 ring-offset-2 ring-blue-500"
                            )}
                            style={{ backgroundColor: color }}
                          ></div>
                        ))}
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="w-full flex flex-row justify-center sm:justify-end">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UpdateWorkspace;
