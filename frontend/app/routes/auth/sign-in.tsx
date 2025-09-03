import { signInSchema } from '@/lib/schema';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';

type SignInFormData = z.infer<typeof signInSchema>

const SignIn = () => {

    const form = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },

    });

    const handleOnsubmit = (values: SignInFormData) => {
        console.log(values)
    }

  return (
    <div className='min-h-screen min-w-screen flex flex-col items-center justify-center bg-gray-600 p-4' >
        <Card className='max-w-md w-auto bg-gray-950 shadow-accent'>
            <CardHeader className='text-center mb-5' >
                <CardTitle className='text-2x1 font-bold shadow-x1 text-white'>
                    Welcome back
                </CardTitle>
                <CardDescription className='text-sm text-muted-foreground'>
                    Sign in to your account to continue
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleOnsubmit)}
                        className='space-y-6'
                    >
                        <FormField
                            control={form.control}
                            name="email"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className='text-2x1 font-bold shadow-x1 text-white'>
                                        Email
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type='email'
                                            placeholder='email@exmaple.com'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className='text-2x1 font-bold shadow-x1 text-white'>
                                        Password
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type='password'
                                            placeholder='*********'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <Button type='submit' className='w-full'>
                            Sign In
                        </Button>

                    </form>
                </Form>

                <CardFooter>
                    <div className='m-1 flex items-center justify-center'>
                        <p className='text-sm text-muted-foreground' >
                            Don&apos;t have an account? <Link to='/sign-up' className='text-blue-400'>Sign up</Link>
                        </p>
                    </div>
                </CardFooter>
            </CardContent>
        </Card>
    </div>
  )
}

export default SignIn;