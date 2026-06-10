"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TbMail, TbLock, TbEye, TbEyeOff, TbHome } from "react-icons/tb";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { login as loginApi } from "@/lib/api";
import Image from "next/image";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long"),
});

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setApiError("");
    setIsLoading(true);
    try {
      const response = await loginApi(data);
      console.log("Login data:", response);
      toast.success("Logged in successfully! Redirecting...");
      reset(); // Clear form values
      router.push("/admin/dashboard");
    } catch (error) {
      setApiError(error.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-black bg-white">
      {/* Left: Image Side */}
      <div className="hidden lg:block lg:w-1/2 relative bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-60 bg-[url('/Home.jpeg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/40 to-transparent" />
      </div>

      {/* Right: Form Side */}
      <div className="w-full bg-muted lg:w-1/2 flex items-center justify-center p-8 md:p-16 relative">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm"
        >
          {/* Logo / Brand Name top of form */}
          <div className="flex justify-center">
            <Image src="/logo2.png" alt="Logo" width={150} height={150} />
          </div>

          <div className="mb-10 text-center">
            <p className="text-green-700 text-xl font-extrabold uppercase tracking-widest border-t border-muted pt-4">
              Admin Portal Access
            </p>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed italic">
              Please log in with your administrative credentials to manage the
              AgriWatch's system.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Input
                {...register("email")}
                placeholder="Email Address"
                icon={TbMail}
                className={`h-14 bg-white border-muted focus:bg-white ${errors.email ? "border-green-600 focus:ring-green-400-500" : ""}`}
              />
              {errors.email && (
                <p className="text-xs font-medium text-red-500 ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                icon={TbLock}
                rightIcon={showPassword ? TbEyeOff : TbEye}
                onClickRightIcon={() => setShowPassword(!showPassword)}
                className={`h-14 bg-white border-muted focus:bg-white ${errors.password ? "border-red-500 focus:ring-red-500" : ""}`}
              />
              {errors.password && (
                <p className="text-xs font-medium text-red-500 ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {apiError && (
              <div className="p-3 mb-4 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm font-medium text-center">
                {apiError}
              </div>
            )}
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full h-14 text-sm font-semibold uppercase"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <div className="flex justify-center py-2">
              <Link
                href="/admin/forgot-password"
                size="sm"
                className="text-green-700 font-bold hover:text-green-600 underline underline-offset-4 text-sm transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
