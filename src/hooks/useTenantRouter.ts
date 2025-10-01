import { useTenant } from "@/context/TenantContext";
import { useRouter } from "next/navigation";

export function useTenantRouter() {
  const tenant = useTenant();
  const router = useRouter();

  function push(path: string) {
    router.push(`/${tenant}${path.startsWith("/") ? path : "/" + path}`);
  }

  function href(path: string) {
    return `/${tenant}${path.startsWith("/") ? path : "/" + path}`;
  }

  return { push, href, tenant };
}