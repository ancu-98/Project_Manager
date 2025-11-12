import type { ProjectMemberRole, Sprint, User } from "@/types/app";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import type z from "zod";
import { updateStartSprintSchema } from "@/lib/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateStarSprintMutation } from "@/hooks/use-sprint";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { Calendar } from "../ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useEffect } from "react";

interface StartSprintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sprint: Sprint;
  projectId: string;
}

export type UpdateStartSprintFormData = z.infer<typeof updateStartSprintSchema>;

const StartSprintDialog = ({
  open,
  onOpenChange,
  sprint,
  projectId,
}: StartSprintDialogProps) => {
  const form = useForm<UpdateStartSprintFormData>({
    resolver: zodResolver(updateStartSprintSchema),
    defaultValues: {
      sprintName: "SCRUM Sprint",
      duration: "customized",
      startDay: "",
      finishDay: "",
      sprintGoal: "",
    },
  });

  // Si el sprint ha sido iniciado
  // Enviar los valores actuales al formulario
    useEffect(() => {
    if (open && sprint.isStarted) {
      form.reset({
        sprintName: sprint.sprintName || "SCRUM Sprint",
        duration: sprint.duration  || "customized",
        startDay: sprint.startDay ? new Date(sprint.startDay).toISOString() : "",
        finishDay: sprint.finishDay ? new Date(sprint.finishDay).toISOString() : "",
        sprintGoal: sprint.sprintGoal || "",
      });
    } else if (open && !sprint.isStarted) {
      // Resetear el formulario si es un sprint nuevo
      form.reset({
        sprintName: "SCRUM Sprint",
        duration: "customized",
        startDay: "",
        finishDay: "",
        sprintGoal: "",
      });
    }
  }, [open, sprint, form]);


  // Listen for changes in duration and startDay
  useEffect(() => {
    const duration = form.watch("duration");
    const startDay = form.watch("startDay");

    // Convertir el valor de startDay a tipo Date (si existe)
    const startDate = startDay ? new Date(startDay) : new Date();

    // function for update dates
    const setDates = (finishOffsetDays: number) => {
      const finishDate = addDays(startDate, finishOffsetDays);
      form.setValue("finishDay", finishDate.toISOString());
    };

    switch (duration) {
      case "1 week":
        if (!form.getValues("startDay"))
          form.setValue("startDay", startDate.toISOString());
        setDates(7);
        break;
      case "2 weeks":
        if (!form.getValues("startDay"))
          form.setValue("startDay", startDate.toISOString());
        setDates(14);
        break;
      case "3 weeks":
        if (!form.getValues("startDay"))
          form.setValue("startDay", startDate.toISOString());
        setDates(21);
        break;
      case "4 weeks":
        if (!form.getValues("startDay"))
          form.setValue("startDay", startDate.toISOString());
        setDates(28);
        break;
      case "customized":
        // No hacer nada
        break;
      default:
        break;
    }
  }, [form.watch("duration"), form.watch("startDay")]);

  const { mutate, isPending } = useUpdateStarSprintMutation(projectId);

  const updateStartSprintSubmit = (values: UpdateStartSprintFormData) => {
    mutate(
      {
        sprintId: sprint._id,
        sprintData: values,
      },
      {
        onSuccess: () => {
          if (sprint.isStarted) {
            toast.success("Sprint edited succesfully");
          } else {
            toast.success("Sprint started succesfully");
          }
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
          {sprint.isStarted ? (
            <DialogTitle>Edit Sprint</DialogTitle>
          ) : (
            <DialogTitle>Start Sprint</DialogTitle>
          )}
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(updateStartSprintSubmit)}
            className="space-y-6"
          >
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="sprintName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sprint Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter Sprint name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormItem>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            <SelectItem value="1 week">1 week</SelectItem>
                            <SelectItem value="2 weeks">2 weeks</SelectItem>
                            <SelectItem value="3 weeks">3 weeks</SelectItem>
                            <SelectItem value="4 weeks">4 weeks</SelectItem>
                            <SelectItem value="customized">
                              Customized
                            </SelectItem>
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
                name="startDay"
                render={({ field }) => {
                  const duration = form.watch("duration");
                  const isDisabled = false; // Siempre habilitado

                  return (
                    <FormItem>
                      <FormLabel>Start Day</FormLabel>
                      <FormControl>
                        <Popover modal={true}>
                          <PopoverTrigger asChild>
                            <button
                              // variant={'outline'}
                              disabled={isDisabled}
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
                  );
                }}
              />

              <FormField
                control={form.control}
                name="finishDay"
                render={({ field }) => {
                  const duration = form.watch("duration");
                  const isDisabled = duration !== "customized"; //Deshabilitado

                  return (
                    <FormItem>
                      <FormLabel>Finish Day</FormLabel>
                      <FormControl>
                        <Popover modal={true}>
                          <PopoverTrigger asChild>
                            <button
                              // variant={'outline'}
                              disabled={isDisabled}
                              className={`
                                    flex flex-row items-center w-full h-8 px-4 py-2 text-xs font-medium border border-input rounded-md
                                    bg-background hover:bg-accent hover:text-accent-foreground
                                    ${!field.value ? "text-muted-foreground" : ""}
                                    ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                                `}
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
                  );
                }}
              />

              <FormField
                control={form.control}
                name="sprintGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sprint Goal</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter sprint goal" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              {sprint.isStarted ? (
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Updating..." : "Edit Sprint"}
                </Button>
              ) : (
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Updating..." : "Start Sprint"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default StartSprintDialog;
