import { signUpSchema } from "@/lib/schema";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { number, z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";
import { userSignUpMutation } from "@/hooks/use-auth";
import { toast } from "sonner";

export type SignUpFormData = z.infer<typeof signUpSchema>;

const SignUp = () => {

  const navigate = useNavigate();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      university: "",
      career: "",
      currentSemester: 1,
    },
  });

  const { mutate, isPending } = userSignUpMutation();

  const handleOnsubmit = (values: SignUpFormData) => {
    mutate(values, {
      onSuccess: () => {
        toast.success('Email Verification Required', {
          description:
          "Please check your email for a verification link. If you don't see it, please check your spam folder."
        });

        form.reset();
        navigate('/sign-in');

      },
      onError: (error: any) =>{
        const errorMessage = error.response?.data?.message || 'An error occurred';
        console.log(error);
        toast.error(errorMessage);
      }
    })
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-cente p-4">
      <Tabs defaultValue="account" className="w-full max-w-sm sm:max-w-md md:max-w-lg">
        <TabsList>
          <TabsTrigger
            value="account"
          >
            Account
          </TabsTrigger>
          <TabsTrigger
            value="university"
          >
            University
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="w-auto">
          <Card className="w-full max-w-sm sm:max-w-md shadow-accent">
            <CardHeader className="text-center sm:mb-5 px-4 sm:px-6" >
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold">
                Create an acount
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleOnsubmit)}
                  className="space-y-4 sm:space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-2x1 font-bold shadow-x1 text-muted-foreground">
                          Email
                        </FormLabel>
                        <FormControl className="text-muted-foreground">
                          <Input
                            className="text-sm sm:text-base"
                            type="email"
                            placeholder="email@exmaple.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-2x1 font-bold shadow-x1 text-muted-foreground">
                          Password
                        </FormLabel>
                        <FormControl className="text-muted-foreground">
                          <Input
                            className="text-sm sm:text-base"
                            type="password"
                            placeholder="*********"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-2x1 font-bold shadow-x1 text-muted-foreground">
                          Confirm Password
                        </FormLabel>
                        <FormControl className="text-muted-foreground">
                          <Input
                            className="text-sm sm:text-base"
                            type="password"
                            placeholder="*********"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full py-2 sm:py-3 text-sm sm:text-base" disabled={isPending}>
                    {isPending ? 'Signing up...' : 'Sign up'}
                  </Button>
                </form>
              </Form>

              <CardFooter className="flex items-center justify-center nt-6">
                <div className="mt-5 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/sign-in" className="text-blue-400">
                      Sign in
                    </Link>
                  </p>
                </div>
              </CardFooter>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="university" className="">
          <Card className="w-full max-w-sm sm:max-w-m shadow-accent">
            <CardHeader className="text-center mb-3 sm:mb-5 px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold">
                Create an acount
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Sign up to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleOnsubmit)}
                  className="space-y-4 sm:space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-2x1 font-bold shadow-x1 text-muted-foreground">
                          Full Name
                        </FormLabel>
                        <FormControl className="text-muted-foreground" >
                          <Input
                            className="text-sm sm:text-base"
                            type="text"
                            placeholder="Jhon Doe"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="university"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-2x1 font-bold shadow-x1 text-muted-foreground">
                          University
                        </FormLabel>
                        <FormControl className="text-muted-foreground" >
                          <Input
                            type="text"
                            placeholder="Universidad de Cundinamarca"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-end space-x-2 min-w-0">
                    <FormField
                      control={form.control}
                      name="career"
                      render={({ field }) => (
                        <FormItem className="flex-1 min-w-0" >
                          <FormLabel className="text-2x1 font-bold shadow-x1 text-muted-foreground">
                            Carreer
                          </FormLabel>
                          <FormControl className="text-muted-foreground">
                            <Input
                              className="text-sm sm:text-base w-full"
                              type="text"
                              placeholder="Ingenieria de Sistemas"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currentSemester"
                      render={({ field }) => (
                        <FormItem className="flex-shrink-0 min-w-[60px] sm:w-[100px]" >
                          <FormLabel className="text-2x1 font-bold shadow-x1 text-muted-foreground">
                            Semester
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={(value) => field.onChange(parseInt(value, 10))} value={field.value?.toString() || ""}>
                              <SelectTrigger className="w-full border-gray-200/20 text-muted-foreground">
                                <SelectValue placeholder="Select" className="text-muted-foreground" />
                              </SelectTrigger>
                              <SelectContent className=" border-gray-200/20 max-h-[280px] overflow-y-auto">
                                <SelectItem value="1">1</SelectItem>
                                <SelectItem value="2">2</SelectItem>
                                <SelectItem value="3">3</SelectItem>
                                <SelectItem value="4">4</SelectItem>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="6">6</SelectItem>
                                <SelectItem value="7">7</SelectItem>
                                <SelectItem value="8">8</SelectItem>
                                <SelectItem value="9">9</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="11">11</SelectItem>
                                <SelectItem value="12">12</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                </form>
              </Form>

              <CardFooter className="flex items-center justify-center nt-6">
                <div className="mt-5 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/sign-in" className="text-blue-400">
                      Sign in
                    </Link>
                  </p>
                </div>
              </CardFooter>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SignUp;
