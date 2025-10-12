"use client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/shared/ui/button";
import React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerUser } from "@/services/userService";
import { signIn } from "next-auth/react";
import { useRegisterFlow } from "@/context/RegisterContext"; // ✅ Usar Context API

const schema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters." }),
  email: z.string().email({ message: "Your email is invalid." }),
  password: z.string().min(4),
});

export default function RegisterPage() {
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();
  
  // ✅ Usar Context API en lugar de Zustand
  const { saveRegistrationData, isLoading, error } = useRegisterFlow();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "all",
  });

  const onSubmit = (data: any) => {
    startTransition(async () => {
      try {
        const response = await registerUser(data);
        if (response) {
          const response2 = await signIn("credentials", {
            redirect: true,
            email: data.email,
            password: data.password,
          });          
          
          if (response2?.error) {
            throw new Error(response2.error);
          }
          saveRegistrationData(response2, data);
          //router.push("/home");          
        }        
      } catch (error: any) {        
        toast.error("Error al crear la cuenta", {
          description: error.message || "Intenta nuevamente"
        });
      }
    });
  };

  const handleGoogleLogin = () => {
    signIn("google", {callbackUrl: '/home'});
  };

  // ✅ Mostrar error del contexto si existe
  React.useEffect(() => {
    if (error) {
      toast.error("Error en registro", { description: error });
    }
  }, [error]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 w-full min-h-screen">
      {/* Columna Izquierda: Formulario */}
      <div className="flex flex-col justify-center items-center p-8 sm:p-12 bg-white md:col-span-2">
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center">
            <Image
              src="/assets/images/insonor.png"
              alt="Logo"
              width={150}
              height={70}
              className="mb-8"
            />
            <h3 className="text-2xl text-gray-800 mb-8">Crear cuenta</h3>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                {...register("name", { required: "Name is required" })}
                placeholder="Enter your name"
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

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
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
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
              <input
                id="password"
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: 8,
                })}
                placeholder="Enter your password"
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-900"
              >
                I agree to the terms & policy
              </label>
            </div>

            <Button className="w-full" disabled={isPending || isLoading}>
              {(isPending || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {(isPending || isLoading) ? "Loading..." : "Sign Up"}
            </Button>
          </form>

          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 flex-shrink text-gray-400 text-sm">Or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isPending || isLoading}
              className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-md border border-gray-300 transition-colors disabled:opacity-50"
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
              Sign Up with Google
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Columna Derecha: Imagen */}
      <div className="hidden md:flex md:col-span-3 relative h-full">
        <Image
          src="/assets/images/register.png"
          alt="Close-up of a monstera plant leaf"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>
    </div>
  );
}
