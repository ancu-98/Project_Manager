import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useVerifyEmailMutation } from '@/hooks/use-auth';
import { ArrowLeft, CheckCircle, Loader, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router';
import { toast } from 'sonner';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();

  const [isSuccess, setIsSuccess] = useState(false);
  const { mutate, isPending: isVerifying } = useVerifyEmailMutation();
  const token = searchParams.get('token');


  useEffect(() =>{

    if (token) {
      mutate(
        { token },
        {
          onSuccess: () => {
            setIsSuccess(true);
          },
          onError: (error: any) => {
            const errorMessage = error.response?.data?.message || 'An error ocurred';
            setIsSuccess(false);
            console.log(error);

            toast.error(errorMessage);
          }
        }
      )
    }
  }, [searchParams]);

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-2x1 font-bold' >Verify Email</h1>
      <p className='text-sm ' >Verifying your email...</p>

      <Card>
        {/* <CardHeader>
          <Link to='/sign-in' className='flex items-center gap-2 text-sm' >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to Sing in
          </Link>
        </CardHeader> */}
        <CardContent>
          <div className='flex flex-col items-center py-6' >
            {
              isVerifying ? (
                <>
                  <Loader className='w-10 h-10 text-gray-500 animate-spin' />
                  <h3 className='text-lg font-semibold' >Verifying email...</h3>
                  <p className='text-sm text-gray-500' >
                    Please wait while we verify your email.
                  </p>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle className='w-10 h-10 text-green-500' />
                  <h3 className='text-lg font-semibold'> Email Verified </h3>
                  <p className='text-sm text-gray-500' >
                    Your email has been verified successfully.
                  </p>
                  <Link to='/sign-in' className='text-sm text-blue-500 mt-8'  >
                    <Button variant='outline'>Back to Sign in</Button>
                  </Link>
                </>
              ) : (
                <>
                  <XCircle className='w-10 h-10 text-red-500' />
                  <h3 className='text-lg font-semibold' >
                    Email Verification Failed
                  </h3>
                  <p className='text-sm text-gray-500' >
                    Your email verification failed. Please try again.
                  </p>

                  <Link to='/sign-in' className='text-sm text-blue-500 mt-8'  >
                    <Button variant='outline'>Back to Sign in</Button>
                  </Link>
                </>
              )
            }
          </div>

        </CardContent>

      </Card>
    </div>
  )
}

export default VerifyEmail;