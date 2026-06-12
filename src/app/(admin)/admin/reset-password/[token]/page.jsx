'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TbLock, TbEye, TbEyeOff, TbArrowLeft } from 'react-icons/tb';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';

const resetPasswordSchema = z.object({
  password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const token = params?.token;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Invalid or missing reset token.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        'https://agriwatch-backenf.onrender.com/auth/resetPassword',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ token, Password: data.password }),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to reset password');
      toast.success('Password updated successfully!');
      setTimeout(() => router.push('/admin/login'), 2000);
    } catch (error) {
      toast.error(error.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EBEFF5] relative p-6">
      {/* Home Link */}
      <div className="absolute top-8 left-8 z-20">
         <Link href="/admin/login" className="flex items-center gap-2 text-white hover:text-primary hover:bg-white  font-semibold  transition-colors text-sm uppercase tracking-widest bg-primary px-6 py-3 rounded border border-border shadow">
          <TbArrowLeft size={20} /> BACK
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-white p-12 md:p-20 shadow-[0_0_50px_rgba(0,0,0,0.05)] rounded-sm"
      >
        <div className="text-center mb-12">
          <h1 className="text-2xl font-semibold text-primary  tracking-tight uppercase">Reset Password</h1>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <div className="text-primary/60 text-lg font-medium mb-4">Set A New Password</div>
            <Input 
              {...register('password')}
              type={showPassword ? "text" : "password"}
              placeholder="Password" 
              icon={TbLock}
              rightIcon={showPassword ? TbEyeOff : TbEye}
              onClickRightIcon={() => setShowPassword(!showPassword)}
              className={`h-14 border-primary border-1 focus:ring-primary ${errors.password ? 'border-red-500' : ''}`}
            />
            {errors.password && (
              <p className="text-sm font-medium text-red-500 ml-1">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Input 
              {...register('confirmPassword')}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password" 
              icon={TbLock}
              rightIcon={showConfirmPassword ? TbEyeOff : TbEye}
              onClickRightIcon={() => setShowConfirmPassword(!showConfirmPassword)}
              className={`h-14 border-primary border-1 focus:ring-primary ${errors.confirmPassword ? 'border-red-500' : ''}`}
            />
            {errors.confirmPassword && (
              <p className="text-sm font-medium text-red-500 ml-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            isLoading={isLoading}
            className="w-full h-14 text-lg font-bold shadow-xl tracking-widest uppercase mt-4"
          >
            {isLoading ? "Resetting..." : "SUBMIT"}
          </Button>
        </form>

        <p className="mt-12 text-center text-muted-foreground/70 text-sm italic">
          New password must be at least 8 characters long.
        </p>
      </motion.div>
    </div>
  );
}
