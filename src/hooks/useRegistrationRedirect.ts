// src/hooks/useRegistrationRedirect.ts
"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useRegistrationRedirect(options?: {
  skipRedirect?: boolean;
  onRedirect?: (path: string) => void;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (options?.skipRedirect || status !== 'authenticated' || !session) {
      return;
    }

    const registrationComplete = session.user?.registrationComplete;
    const isNewUser = session.isNewUser;
    const workspaceSlug = session.workspace?.slug;

    console.log('[REGISTRATION_REDIRECT] Analyzing state:', {
      registrationComplete,
      isNewUser,
      workspaceSlug
    });

    let redirectPath: string | null = null;

    if (isNewUser === true || registrationComplete === false) {
      // Necesita completar onboarding
      redirectPath = `/register-onboarding${workspaceSlug ? `?workspace=${workspaceSlug}` : ''}`;
    } else if (registrationComplete === true && workspaceSlug) {
      // Registro completo -> Workspace
      redirectPath = `/${workspaceSlug}/home`;
    } else if (registrationComplete === true) {
      // Registro completo sin workspace -> Dashboard
      redirectPath = '/dashboard';
    }

    if (redirectPath) {
      console.log('[REGISTRATION_REDIRECT] Redirecting to:', redirectPath);
      options?.onRedirect?.(redirectPath);
      router.push(redirectPath);
    }
  }, [session, status, router, options]);

  return {
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    registrationComplete: session?.user?.registrationComplete,
    isNewUser: session?.isNewUser,
    workspaceSlug: session?.workspace?.slug,
  };
}