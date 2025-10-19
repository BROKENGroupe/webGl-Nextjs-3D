import React from "react";

interface WorkspaceInfoProps {
  name: string;
  description?: string;
  members?: number;
  createdAt?: string | Date;
}

export const WorkspaceInfo: React.FC<WorkspaceInfoProps> = ({
  name,
  description,
  members,
  createdAt,
}) => {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{name}</h2>
      {description && (
        <p className="text-gray-600 mb-4">{description}</p>
      )}
      <div className="flex flex-wrap gap-6 text-sm text-gray-500">
        {typeof members === "number" && (
          <div>
            <span className="font-medium text-gray-900">{members}</span> miembros
          </div>
        )}
        {createdAt && (
          <div>
            Creado el{" "}
            <span className="font-medium text-gray-900">
              {new Date(createdAt).toLocaleDateString("es-CO", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        )}
      </div>
    </section>
  );
};