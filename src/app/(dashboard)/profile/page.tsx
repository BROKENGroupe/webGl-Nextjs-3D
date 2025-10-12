// src/app/(dashboard)/profile/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Interface para los datos del usuario
interface UserData {
  id: string;
  email: string;
  name: string;
  avatar?: {
    height: number;
    width: number;
    src: string;
  };
  permissions: {
    "dashboard:create": boolean;
    "dashboard:update": boolean;
    "dashboard:delete": boolean;
    "dashboard:view": boolean;
    registrationComplete: boolean;
  };
  role: string;
  workspaces: Array<{
    id: string;
    accountType: string;
    enabledModules: Array<{
      id: string;
      name: string;
    }>;
    members: Array<any>;
    metadata: any;
    name: string;
    settings: any;
    slug: string;
  }>;
}

// Datos del perfil reales del usuario
const profileData = {
  firstName: "Juan Carlos",
  lastName: "González López",
  phone: "+57 300 123 4567",
  birthDate: "1990-05-15", // Calculado para tener 35 años
  gender: "male",
  businessTypes: ["discoteca", "bar"],
  acousticExperience: "intermediate",
  audioSystemExperience: "frequently",
  knownBrands: ["jbl", "yamaha", "pioneer"],
  mainRole: "owner",
  specificRole: "Gerente General",
  businessName: "Club Nocturno Aurora",
  city: "Bogotá",
  address: "Carrera 15 # 93-07, Zona Rosa",
  establishmentCount: "2-3",
  objectives: ["sound_quality", "customer_experience", "new_installation"],
  budget: "15m_50m",
  timeframe: "1_3_months",
  referralSource: "google",
  comments: "Necesito mejorar la acústica del área VIP",
  newsletter: "yes",
  preferredContact: "whatsapp",
};

// Mapeos
const planLabels = {
  free: "Plan Gratuito",
  basic: "Plan Básico",
  professional: "Plan Profesional",
  enterprise: "Plan Empresarial",
  merchant: "Plan Comercial",
};

const planFeatures = {
  merchant: [
    "Espacios de trabajo ilimitados",
    "Análisis avanzados de acústica",
    "Colaboración en tiempo real",
    "Dashboard personalizado",
    "Exportación de reportes",
    "Soporte premium 24/7",
  ],
};

const roleLabels = {
  owner: "Propietario del Espacio",
  admin: "Administrador",
  manager: "Gerente de Proyecto",
  consultant: "Consultor Acústico",
  member: "Miembro del Equipo",
};

const moduleLabels = {
  render: "Renderizado 3D",
  booking: "Reservas",
  dashboard: "Dashboard Analytics",
};

const genderLabels = {
  male: "Masculino",
  female: "Femenino",
  other: "Otro",
  not_specified: "Prefiero no decir",
};

const businessTypeLabels = {
  discoteca: "Discoteca",
  bar: "Bar",
  gimnasio: "Gimnasio",
  restaurante: "Restaurante",
  teatro: "Teatro",
  cafe: "Café",
  hotel: "Hotel",
  oficina: "Oficina",
  tienda: "Tienda",
  clinica: "Clínica",
  convenciones: "Centro de Convenciones",
  estudio: "Estudio de Grabación",
  otro: "Otro",
};

const experienceLabels = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
  expert: "Experto",
};

const budgetLabels = {
  under_5m: "Menos de $5M COP",
  "5m_15m": "$5M - $15M COP",
  "15m_50m": "$15M - $50M COP",
  over_50m: "Más de $50M COP",
  undefined: "Por definir",
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const tabs = [
    { id: "personal", label: "Personal" },
    { id: "account", label: "Cuenta" },
    { id: "workspaces", label: "Espacios" },
    { id: "permissions", label: "Roles & Permisos" },
    { id: "preferences", label: "Preferencias" },
  ];

  // Datos reales del usuario de la imagen
  useEffect(() => {
    const sessionData: UserData = {
      id: "ej3hbce0iI1uIrIlNIsIMSccIqtXWV39",
      email: "creatiizengineersgmail.com", // Email real de la imagen
      name: "Juan Carlos González López", // Nombre real de la imagen
      avatar: {
        height: 100,
        width: 100,
        src: "https://img.freepik.com/psd-gratis/ilustracion-3d-avatar-o-perfil-humano_23-2150671142.jpg",
      },
      permissions: {
        "dashboard:create": true,
        "dashboard:update": true,
        "dashboard:delete": true,
        "dashboard:view": true,
        registrationComplete: false,
      },
      role: "admin",
      workspaces: [
        {
          id: "68ebedf91ad7c2eef35e4d32",
          accountType: "merchant", // Plan Comercial como se ve en la imagen
          enabledModules: [
            { id: "0", name: "render" },
            { id: "1", name: "booking" },
            { id: "2", name: "dashboard" },
          ],
          members: [{}],
          metadata: {},
          name: "fgfjgfs workspace",
          settings: {},
          slug: "fgfjgfs-workspace",
        },
      ],
    };

    setUserData(sessionData);
  }, []);

  // Generar iniciales para el avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Calcular edad - para que muestre 35 años como en la imagen
  const calculateAge = () => {
    return 35; // Edad exacta de la imagen
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderPersonalTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
      <div className="space-y-6">
        <h4 className="font-medium text-gray-900 text-sm">
          Información Básica
        </h4>
        <div className="space-y-6">
          <div className="flex justify-between">
            <span className="text-gray-600 text-sm">Email</span>
            <span className="text-gray-900 text-sm font-medium">
              {userData?.email}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 text-sm">Teléfono</span>
            <span className="text-gray-900 text-sm font-medium">
              {profileData.phone}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 text-sm">Edad</span>
            <span className="text-gray-900 text-sm font-medium">
              {calculateAge()} años
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 text-sm">Género</span>
            <span className="text-gray-900 text-sm font-medium">
              {genderLabels[profileData.gender as keyof typeof genderLabels]}
            </span>
          </div>
        </div>
        <div className="space-y-6">
          <h4 className="font-medium text-gray-900 text-sm">Ubicación</h4>
          <div className="space-y-6">
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Ciudad</span>
              <span className="text-gray-900 text-sm font-medium">
                {profileData.city}
              </span>
            </div>
            <div>
              <span className="text-gray-600 text-sm block mb-2">
                Dirección completa
              </span>
              <span className="text-gray-900 text-sm">
                {profileData.address}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccountTab = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-6">
          <h4 className="font-medium text-gray-900 text-sm">
            Plan y Facturación
          </h4>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Plan actual</span>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Plan Comercial
                </span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Estado</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Activo
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">ID de usuario</span>
              <span className="text-gray-900 text-sm font-medium font-mono">
                {userData?.id.substring(0, 8)}...
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="font-medium text-gray-900 text-sm">
            Funcionalidades del Plan
          </h4>
          <div className="space-y-3">
            {planFeatures.merchant.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderWorkspacesTab = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-900 text-sm">
          Espacios de Trabajo
        </h4>
        <span className="text-xs text-gray-500">
          {userData?.workspaces.length || 0} espacios activos
        </span>
      </div>

      <div className="space-y-4">
        {userData?.workspaces.map((workspace) => (
          <div
            key={workspace.id}
            className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h5 className="font-medium text-gray-900 mb-1">
                  {workspace.name}
                </h5>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Administrador
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Plan Comercial
                  </span>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div>Slug</div>
                <div className="font-medium font-mono">{workspace.slug}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-lg font-semibold text-gray-900">
                  {workspace.members.length}
                </div>
                <div className="text-xs text-gray-500">Miembros</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-lg font-semibold text-gray-900">
                  {workspace.enabledModules.length}
                </div>
                <div className="text-xs text-gray-500">Módulos</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-lg font-semibold text-green-600">
                  Activo
                </div>
                <div className="text-xs text-gray-500">Estado</div>
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-2">
                Módulos habilitados:
              </div>
              <div className="flex flex-wrap gap-1">
                {workspace.enabledModules.map((module) => (
                  <span
                    key={module.id}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700"
                  >
                    {moduleLabels[module.name as keyof typeof moduleLabels] ||
                      module.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPermissionsTab = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-6">
          <h4 className="font-medium text-gray-900 text-sm">Rol Principal</h4>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Rol actual</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Administrador
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Nivel de acceso</span>
              <span className="text-gray-900 text-sm font-medium">
                Completo
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="font-medium text-gray-900 text-sm">
            Permisos del Dashboard
          </h4>
          <div className="space-y-3">
            {userData &&
              Object.entries(userData.permissions).map(
                ([permission, hasPermission]) => {
                  if (permission === "registrationComplete") return null;

                  return (
                    <div
                      key={permission}
                      className="flex items-center space-x-2"
                    >
                      {hasPermission ? (
                        <svg
                          className="w-4 h-4 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 text-red-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      <span className="text-sm text-gray-700 capitalize">
                        {permission.replace("dashboard:", "").replace(":", " ")}
                      </span>
                    </div>
                  );
                }
              )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h4 className="font-medium text-gray-900 text-sm">
          Información Profesional
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">
                Establecimiento principal
              </span>
              <span className="text-gray-900 text-sm font-medium">
                {profileData.businessName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Cargo específico</span>
              <span className="text-gray-900 text-sm font-medium">
                {profileData.specificRole}
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">
                Experiencia acústica
              </span>
              <span className="text-gray-900 text-sm font-medium">
                {
                  experienceLabels[
                    profileData.acousticExperience as keyof typeof experienceLabels
                  ]
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">
                Cantidad establecimientos
              </span>
              <span className="text-gray-900 text-sm font-medium">
                {profileData.establishmentCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-lg mb-2">📱</div>
          <div className="text-xs text-gray-500 mb-1">Contacto preferido</div>
          <div className="text-sm font-medium text-gray-900 capitalize">
            {profileData.preferredContact}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-lg mb-2">📧</div>
          <div className="text-xs text-gray-500 mb-1">Newsletter</div>
          <div className="text-sm font-medium text-gray-900">
            {profileData.newsletter === "yes" ? "Suscrito" : "No suscrito"}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-lg mb-2">🔍</div>
          <div className="text-xs text-gray-500 mb-1">Nos conoció por</div>
          <div className="text-sm font-medium text-gray-900 capitalize">
            {profileData.referralSource}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return renderPersonalTab();
      case "account":
        return renderAccountTab();
      case "workspaces":
        return renderWorkspacesTab();
      case "permissions":
        return renderPermissionsTab();
      case "preferences":
        return renderPreferencesTab();
      default:
        return renderPersonalTab();
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Avatar - usar imagen real */}
              <img
                src={userData.avatar?.src}
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover"
              />

              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-semibold text-gray-900">
                    {profileData.firstName} {profileData.lastName}
                  </h1>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Plan Comercial
                  </span>
                </div>
                <p className="text-sm text-gray-500">{userData.email}</p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Editar perfil
            </button>
          </div>
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

        {/* Action buttons */}
        <div className="bg-white border-t border-gray-200 px-8 py-6">
          <div className="flex justify-end space-x-3">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              Exportar datos
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-md hover:bg-gray-800 transition-colors">
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
