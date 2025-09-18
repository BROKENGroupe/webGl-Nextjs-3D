"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { loginUser, registerUser } from "@/services/authService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CreateUserDto } from "../types/user";

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserDto>();
  const router = useRouter();

  const onSubmit: SubmitHandler<CreateUserDto> = async (data) => {
    try {
      await registerUser(data);
      alert("¡Registro exitoso! Serás redirigido para iniciar sesión.");
      await loginUser({ email: data.email, password: data.password });
      router.push("/");
    } catch (error: any) {
      const errorMessages = error.response?.data?.message || [error.message];
      alert("Error en el registro: " + [].concat(errorMessages).join("\n"));
    }
  };

  const handleGoogleLogin = () => {
    alert("Google login no implementado");
  };
  const handleAppleLogin = () => {
    alert("Apple login no implementado");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 w-full min-h-screen">
      {/* Columna Izquierda: Formulario */}
      <div className="flex flex-col justify-center items-center p-8 sm:p-12 bg-white md:col-span-2">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Get Started Now
          </h1>

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

            {/* <div>
              <label
                htmlFor="surname"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Surname
              </label>
              <input
                id="surname"
                type="text"
                {...register("surname", { required: "Surname is required" })}
                placeholder="Enter your surname"
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
              {errors.surname && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.surname.message}
                </p>
              )}
            </div> */}

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

            {/* <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                {...register("phone", { required: "Phone is required" })}
                placeholder="Enter your phone number"
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div> */}

            {/* <div>
              <label
                htmlFor="birthdaydate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Birthday Date
              </label>
              <input
                id="birthdaydate"
                type="date"
                {...register("birthdaydate", {
                  required: "Birthday date is required",
                })}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
              {errors.birthdaydate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.birthdaydate.message}
                </p>
              )}
            </div> */}

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

            <button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-4 rounded-md transition-colors"
            >
              Signup
            </button>
          </form>

          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 flex-shrink text-gray-400 text-sm">Or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-md border border-gray-300 transition-colors"
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
              Sign in with Google
            </button>
            <button
              onClick={handleAppleLogin}
              className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-md border border-gray-300 transition-colors"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M15.228.002a4.234 4.234 0 00-1.423.273c-1.137.52-2.222 1.624-2.885 2.806-1.284 2.296-1.018 5.438.531 6.828-1.55 1.488-3.693 4.218-3.693 7.857a.38.38 0 00.38.384h.02a.38.38 0 00.378-.365c0-.02-.002-.073.004-.153.05-.595.274-1.163.593-1.685.5-.792 1.2-1.492 2.05-2.025.86-.54 1.81-.884 2.825-.947a.363.363 0 01.37.366c0 1.25-.333 2.44-.94 3.518-.62 1.1-.986 2.373-1.02 3.655a.38.38 0 00.38.385h.02a.38.38 0 00.379-.365c.03-.83.33-1.616.824-2.285.52-.693 1.25-1.22 2.1-1.528.9-.32 1.9-.34 2.88-.06a.377.377 0 00.443-.335c.143-1.218-.184-2.618-.887-3.68-.7-.98-1.74-1.62-2.95-1.8-1.2-.18-2.4.15-3.32.84-.04.03-.09.06-.13.09.02-.03.04-.06.06-.09.84-.96 1.1-2.47.6-3.72-1.25-3.1-4.06-3.46-4.66-3.53a.36.36 0 01-.35-.27zm1.18 1.99a2.38 2.38 0 012.333 1.43c.4 1.02.16 2.25-.56 3.06-.76.83-1.95 1.09-3.03.62a2.44 2.44 0 01-1.5-2.4c.15-1.3.98-2.3 2.1-2.43.23-.02.46-.02.66 0z"></path>
              </svg>
              Sign in with Apple
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-green-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Columna Derecha: Imagen */}
      <div className="hidden relative md:block top-0 left-0 w-full h-full md:col-span-3">
        <Image
          src="https://images.unsplash.com/photo-1755127761414-c4f552bb3549?q=80&w=686&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Close-up of a monstera plant leaf"
          layout="fill"
          objectFit="cover"
        />
      </div>
    </div>
  );
}
