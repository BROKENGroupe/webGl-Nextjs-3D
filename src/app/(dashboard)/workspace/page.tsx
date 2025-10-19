"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WorkspaceInfo } from "@/modules/workspace/components/WorkspaceInfo";
import { Switch } from "@/shared/ui/switch";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerFooter,
} from "@/shared/ui/drawer";
import { Label } from "@/shared/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Home } from "lucide-react";

const moduleLabels: Record<string, string> = {
  render: "Renderizado 3D",
  workspace: "Workspace",
  dashboard: "Dashboard Analytics",
  places: "Establecimientos",
};

const tabs = [
  { id: "info", label: "Información" },
  { id: "members", label: "Miembros" },
  { id: "modules", label: "Módulos" },
];

// Agrupa permisos por módulo
const groupedPermissions = [
  {
    module: "Dashboard",
    description: "Permisos relacionados con el dashboard principal.",
    color: "",
    permissions: [
      { key: "dashboard:create", label: "Crear" },
      { key: "dashboard:update", label: "Actualizar" },
      { key: "dashboard:delete", label: "Eliminar" },
      { key: "dashboard:view", label: "Ver" },
    ],
  },
  {
    module: "Establecimientos",
    description: "Permisos para gestionar establecimientos y ubicaciones.",
    color: "",
    permissions: [
      { key: "places:create", label: "Crear" },
      { key: "places:update", label: "Actualizar" },
      { key: "places:delete", label: "Eliminar" },
      { key: "places:view", label: "Ver" },
    ],
  },
  {
    module: "Workspace",
    description: "Permisos para gestionar el workspace y sus miembros.",
    color: "",
    permissions: [
      { key: "workspace:invite", label: "Invitar miembros" },
      { key: "workspace:update", label: "Editar workspace" },
      { key: "workspace:delete", label: "Eliminar workspace" },
      { key: "workspace:view", label: "Ver workspace" },
    ],
  },
  {
    module: "Reportes",
    description: "Permisos para generar y gestionar reportes.",
    color: "",
    permissions: [
      { key: "reports:generate", label: "Generar" },
      { key: "reports:download", label: "Descargar" },
      { key: "reports:view", label: "Ver" },
    ],
  },
];

export default function WorkspacePage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("info");
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  useEffect(() => {
    // Aquí deberías usar tu hook real de sesión (ej: useSession())
    // setSession(getSession());
  }, []);

  // Maneja el cambio de permisos para un miembro
  const changePermissionHandler = (permissionKey: string, checked: boolean) => {
    // setSelectedMember((prev: any) => ({
    //   ...prev,
    //   permissions: {
    //     ...prev?.permissions,
    //     [permissionKey]: checked,
    //   },
    // }));
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando workspace...</p>
        </div>
      </div>
    );
  }

  if (!session?.workspace) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-gray-600">
          No hay información de workspace disponible.
        </div>
      </div>
    );
  }

  const { workspace, user } = session;

  // Drawer para editar permisos
  const MemberDrawer = ({ open, onClose, member, setMember }: any) => (
    <Drawer open={open} onClose={onClose} direction="right">
      <DrawerContent className="max-w-xl ml-auto border-l border-gray-200 bg-white">
        <DrawerHeader className="flex flex-row items-center justify-between border-b px-8 py-6">
          <DrawerTitle className="text-lg font-semibold text-gray-900">
            Permisos de{" "}
            <span className="block text-base font-normal text-gray-600">
              {member?.email}
            </span>
          </DrawerTitle>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-gray-900"
            >
              <span className="sr-only">Cerrar</span>
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10">
          {groupedPermissions.map((group) => (
            <div key={group.module}>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  className="rounded px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800"
                >
                  {group.module}
                </Badge>
                <span className="text-xs text-gray-400">Módulo</span>
              </div>
              <div className="text-xs text-gray-500 mb-4">
                {group.description}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.permissions.map((perm) => (
                  <div
                    key={perm.key}
                    className="flex items-center justify-between gap-4 py-2"
                  >
                    <Label className="text-gray-700">{perm.label}</Label>
                    <Switch
                      checked={!!member?.permissions?.[perm.key]}
                      onCheckedChange={(checked: boolean) =>
                        changePermissionHandler(perm.key, checked)
                      }
                      className="scale-90"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <DrawerFooter className="border-t px-8 py-6 flex justify-end">
          <Button
            className="bg-black text-white hover:bg-gray-900"
            onClick={onClose}
          >
            Guardar cambios
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );

  // Tab de miembros con avatar real
  const renderMembersTab = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Miembros</h3>
        <Button
          className="bg-black text-white hover:bg-gray-900"
          onClick={() => {
            // Aquí deberías llamar a tu API para crear el usuario
          }}
        >
          + Agregar usuario
        </Button>
      </div>
      <ul>
        {(workspace.members || []).map((member: any) => (
          <li
            key={member.email}
            className="py-4 border-b last:border-b-0 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition"
            onClick={() => {
              setSelectedMember({
                ...member,
                permissions: user.permissions || {},
              });
              setShowMemberModal(true);
            }}
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.image?.src} alt={member.email} />
              <AvatarFallback>
                {member.email
                  ? member.email
                      .split("@")[0]
                      .split(".")
                      .map((n: string) => n[0]?.toUpperCase())
                      .join("")
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-gray-900">{member.email}</span>
            <span className="ml-auto text-gray-500 capitalize">
              {member.role}
            </span>
          </li>
        ))}
      </ul>
      <MemberDrawer
        open={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        member={selectedMember}
        setMember={setSelectedMember}
      />
    </div>
  );

  const renderInfoTab = () => (
    <div className="space-y-8">
      <WorkspaceInfo
        name={workspace.name ?? ""}
        description={workspace.slug ?? undefined}
        members={(workspace.members ?? []).length}
        createdAt={workspace.members?.[0]?.createdAt}
      />
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Tipo de cuenta
        </h3>
        <div className="text-gray-700 capitalize">{workspace.accountType}</div>
      </div>
    </div>
  );

  const renderModulesTab = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Módulos habilitados
      </h3>
      <div className="flex flex-wrap gap-2">
        {(workspace.enabledModules ?? []).map((mod: string) => (
          <span
            key={mod}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700"
          >
            {moduleLabels[mod] || mod}
          </span>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "info":
        return renderInfoTab();
      case "members":
        return renderMembersTab();
      case "modules":
        return renderModulesTab();
      default:
        return renderInfoTab();
    }
  };

  // Header con icono Home y avatar
  return (
    <div className="min-h-screen bg-white">
      <div className="w-full">
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Home icon */}
              <Home className="w-7 h-7 text-gray-700" />
              <h1 className="text-2xl font-bold text-gray-900">
                {workspace.name}
              </h1>
            </div>
            <Button variant="outline" className="border-gray-300">
              Editar workspace
            </Button>
          </div>
          <p className="text-sm text-gray-500">{workspace.slug}</p>
        </div>
        {/* Tabs navigation */}
        <div className="bg-white border-b border-gray-200 px-8">
          <nav className="flex space-x-12">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 text-sm font-medium border-b-2 transition-colors
                  ${
                    activeTab === tab.id
                      ? "border-gray-900 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="bg-white">
          <div className="px-8 py-12">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}