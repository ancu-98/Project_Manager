import { signInSchema } from "@/lib/schema";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";
import { useLoginMutation } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/provider/auth.context";

type SignInFormData = z.infer<typeof signInSchema>;

const SignIn = () => {

  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {mutate, isPending} = useLoginMutation();

  const handleOnsubmit = (values: SignInFormData) => {
    mutate(values, {
      onSuccess: (data => {
        login(data);
        console.log(data);
        console.log('Login successful');
        navigate('/dashboard');
      }),
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || 'An error ocurred';
        console.log(error);
        toast.error(errorMessage);
      },
    })
  };

  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center justify-cente p-4">
      <Card className="max-w-md w-auto shadow-accent">
        <CardHeader className="text-center mb-5">
          <CardTitle className="text-2x1 font-bold shadow-x1">
            Welcome back
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleOnsubmit)}
              className="space-y-6"
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
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-2x1 font-bold shadow-x1 text-muted-foreground">
                        Password
                      </FormLabel>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-blue-600"
                      >
                        forgot password?
                      </Link>
                    </div>
                    <FormControl className="text-muted-foreground">
                      <Input
                        type="password"
                        placeholder="*********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isPending} >
                {isPending ? <Loader2 className='w-4 h-4 -mr-2' /> : 'Sign in'}
              </Button>
            </form>
          </Form>

          <CardFooter className="flex items-center justify-center nt-6">
            <div className="mt-5 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link to="/sign-up" className="text-blue-400">
                  Sign up
                </Link>
              </p>
            </div>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
