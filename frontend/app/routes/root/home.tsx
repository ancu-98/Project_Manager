import React from 'react'
import type { Route } from '../../+types/root';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TaskHub" },
    { name: "description", content: "Welcome to TaskHub!" },
  ];
}

const HomePage = () => {
  return (
    <div className='w-full h-screen flex items-center justify-center gap-4'>
      <Button asChild className='bg-blue-500 text-white'>
        <Link to='/sign-in'> Login </Link>
      </Button>
      <Button asChild variant='outline' className='bg-blue-500 text-white'>
        <Link to='/sign-up'> Sign Up </Link>
      </Button>
    </div>
  )
}

export default HomePage