'use client'
import "../globals.css";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/shared/ui/sidebar";
import { Separator } from "@/shared/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
import { AppSidebar } from "@/components/layouts/app-sidebar";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  const isEditor = pathname.startsWith("/editor");

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 flex-1">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    WebGL 3D Builder
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Creador de Formas 3D</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <button
            className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-lg shadow-sm hover:bg-neutral-800 transition font-medium text-sm mr-4"
            onClick={() => {
              if (isEditor) {
                router.push("/dashboard/home");
              } else {
                router.push("/editor");
              }
            }}
          >
            <span className="text-lg font-bold">{isEditor ? "⎋" : "+"}</span>
            {isEditor ? "Salir" : "Iniciar estudio"}
          </button>
        </header>
        <div className="flex flex-1 flex-col gap-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
