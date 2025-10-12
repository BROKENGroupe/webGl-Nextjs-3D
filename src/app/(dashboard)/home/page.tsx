"use client";
import { redirect } from "next/navigation";
import { LoadingComponent } from "@/components/atoms/loadingcomponent";
import { useTypedSession } from "@/hooks/useTypedSession";
import { useAccess } from "@/context/AccessContext";
import * as React from "react";

//   Importar el componente Dashboard dinámicamente
const DashboardContent = React.lazy(() =>
  import("@/components/dashboard/DashboardContent")
);

export default function HomePage() {
  const { session, status } = useTypedSession();
  const {
    workspace,
    hasPermission,
    isReady: accessReady,
    isLoading: accessLoading,
  } = useAccess();

  console.log("🏠 Dashboard HomePage render:", {
    status,
    hasSession: !!session,
    accessReady,
    accessLoading,
    workspaceName: workspace?.name,
  });

  //   Verificar si todos los datos están listos (igual que en AppSidebar)
  const isDataReady = React.useMemo(() => {
    const authReady = status !== "loading";
    const accessDataReady = accessReady && !accessLoading;

    console.log("🔍 Dashboard HomePage readiness check:", {
      authStatus: status,
      authReady,
      accessReady,
      accessLoading,
      accessDataReady,
      finalReady: authReady && accessDataReady,
    });

    return authReady && accessDataReady;
  }, [status, accessReady, accessLoading]);

  //   Procesar lógica de redirección solo cuando todo esté listo
  const redirectDecision = React.useMemo(() => {
    if (!isDataReady) {
      console.log("⏳ Dashboard HomePage data not ready, waiting...");
      return { shouldRedirect: false, path: null, reason: "loading" };
    }

    console.log("  Processing dashboard redirect logic - everything is ready");

    //   No autenticado -> Login
    if (status === "unauthenticated") {
      console.log("🚪 Not authenticated, redirecting to login");
      return {
        shouldRedirect: true,
        path: "/auth/login",
        reason: "unauthenticated",
      };
    }

    //   Autenticado -> Analizar estado de registro
    if (status === "authenticated" && session) {
      const registrationComplete = session.user?.registrationComplete;
      const workspaceSlug = workspace?.slug || session.workspace?.slug;

      console.log("🔍 Dashboard user state analysis:", {
        registrationComplete,
        workspaceSlug,
        userId: session.user?.id,
        workspaceFromContext: workspace?.slug,
        workspaceFromSession: session.workspace?.slug,
      });      

      if (registrationComplete === false) {
        console.log("📝 Registration incomplete - redirecting to onboarding");
        const onboardingPath = `/register-onboarding${
          workspaceSlug ? `?workspace=${workspaceSlug}` : ""
        }`;
        return {
          shouldRedirect: true,
          path: onboardingPath,
          reason: "registration_incomplete",
        };
      }

      //   Estado indefinido/null -> Onboarding por seguridad
      if (registrationComplete === undefined || registrationComplete === null) {
        console.log("❓ Undefined registration state, defaulting to onboarding");
        const onboardingPath = `/register-onboarding${
          workspaceSlug ? `?workspace=${workspaceSlug}` : ""
        }`;
        return {
          shouldRedirect: true,
          path: onboardingPath,
          reason: "undefined_state",
        };
      }

      //   Registro COMPLETO - Ahora verificar acceso al dashboard específicamente
      if (registrationComplete === true) {
        console.log("  Registration complete, checking dashboard access");

        //   Si tiene workspace pero no permisos de dashboard, ir al workspace home
        if (workspaceSlug && !hasPermission("dashboard:view")) {
          console.log("❌ No dashboard permissions, redirecting to workspace home");
          return {
            shouldRedirect: true,
            path: `/${workspaceSlug}/home`,
            reason: "no_dashboard_permission",
          };
        }

        //   Si no tiene workspace específico pero no tiene permisos generales de dashboard
        if (!workspaceSlug && !hasPermission("dashboard:view")) {
          console.log("❌ No dashboard permissions and no workspace, creating default redirect");
          return {
            shouldRedirect: true,
            path: "/profile", // o donde quieras enviar usuarios sin dashboard access
            reason: "no_dashboard_no_workspace",
          };
        }

        //   Todo bien, puede acceder al dashboard
        console.log("  Can access dashboard");
        return {
          shouldRedirect: false,
          path: null,
          reason: "can_access_dashboard",
        };
      }
    }

    //   No hay redirección necesaria
    return { shouldRedirect: false, path: null, reason: "no_redirect_needed" };
  }, [isDataReady, status, session, workspace, hasPermission]);

  //   Ejecutar redirección cuando esté lista
  React.useEffect(() => {
    if (redirectDecision.shouldRedirect && redirectDecision.path) {
      console.log(
        `🚀 Executing dashboard redirect to: ${redirectDecision.path} (reason: ${redirectDecision.reason})`
      );
      redirect(redirectDecision.path);
    }
  }, [redirectDecision]);

  //   Mostrar loading mientras espera o procesa redirección
  if (!isDataReady) {
    return (
      <LoadingComponent 
      />
    );
  }

  if (redirectDecision.shouldRedirect) {
    return (
      <LoadingComponent
      />
    );
  }

  //   Verificación final de permisos antes de mostrar dashboard
  // Esta verificación es redundante pero sirve como failsafe
  if (!hasPermission("dashboard:view")) {
    console.log("❌ Final permission check failed for dashboard:view");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">
            No tienes permisos para acceder al dashboard
          </p>
          <div className="space-x-4">
            {workspace?.slug ? (
              <button
                onClick={() => redirect(`/${workspace.slug}/home`)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Ir al Workspace
              </button>
            ) : (
              <button
                onClick={() => redirect("/profile")}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Ir al Perfil
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  //   Mostrar dashboard con Suspense para lazy loading
  return (
    <React.Suspense
      fallback={<LoadingComponent />}
    >
      <DashboardContent />
    </React.Suspense>
  );
}