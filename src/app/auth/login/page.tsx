"use client";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import React, { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginCredentialSchema } from "@/schemas/loginCredentials.schema";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isPending, startTransition] = React.useTransition();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const route = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginCredentialSchema),
    mode: "all",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: any) => {
    setLoading(true);
    startTransition(async () => {
      try {
        let response = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: true,
          callbackUrl: "/home",
        });
        debugger
        if (response?.ok) {
          toast.success("Login Successful");
        } else if (response?.error) {
          toast.error("Ups algo salió mal!");
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/home" });
  };

  return (
   <div className="grid grid-cols-1 md:grid-cols-5 w-full min-h-screen bg-gray-50">
      {/* Columna Izquierda: Formulario */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-10 bg-white md:col-span-2">
        <div className="w-full max-w-sm bg-white px-6 py-8 border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <Image
              src="/assets/images/insonor.png"
              alt="Logo"
              width={120}
              height={50}
              className="mb-0"
            />
            <h3 className="text-xl font-semibold text-gray-900">Iniciar sesión</h3>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                {...register("email", { required: "Email is required" })}
                placeholder="Enter your email"
                className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-sm"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                  placeholder="Enter your password"
                  className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-sm pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Ver contraseña"
                  }
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button className="w-full rounded-lg text-base font-semibold py-2" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Loading..." : "Sign In"}
            </Button>
          </form>

          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-4 flex-shrink text-gray-400 text-xs">Or</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-200 transition-colors"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#FFC107"
                  d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                ></path>
                <path
                  fill="#FF3D00"
                  d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
                ></path>
                <path
                  fill="#4CAF50"
                  d="m24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.223 0-9.657-3.356-11.303-7.916l-6.573 5.127C9.505 39.556 16.227 44 24 44z"
                ></path>
                <path
                  fill="#1976D2"
                  d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.574l6.19 5.238C39.904 35.638 44 28.718 44 20c0-1.341-.138-2.65-.389-3.917z"
                ></path>
              </svg>
              <span className="text-sm font-medium">Sign in with Google</span>
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-blue-600 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Columna Derecha: Imagen */}
      <div className="hidden md:flex md:col-span-3 relative h-full">
        <Image
          src="/assets/images/login-wall.png"
          alt="Close-up of a monstera plant leaf"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>
    </div>
  );
}
