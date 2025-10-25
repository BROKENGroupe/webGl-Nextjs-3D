export enum Permission {
  // Dashboard
  DashboardView = "dashboard:view",
  DashboardCreate = "dashboard:create",
  DashboardEdit = "dashboard:edit",
  DashboardDelete = "dashboard:delete",

  // Editor
  EditorView = "editor:view",
  EditorCreate = "editor:create",
  EditorEdit = "editor:edit",
  EditorDelete = "editor:delete",

  // Workspace
  WorkspaceView = "workspace:view",
  WorkspaceCreate = "workspace:create",
  WorkspaceEdit = "workspace:edit",
  WorkspaceDelete = "workspace:delete",

  // Places
  PlacesView = "places:view",
  PlacesCreate = "places:create",
  PlacesEdit = "places:edit",
  PlacesDelete = "places:delete",

  // Audit
  AuditView = "audit:view",
  AuditCreate = "audit:create",
  AuditEdit = "audit:edit",
  AuditDelete = "audit:delete",
}

export enum Role {
  Admin = "admin",
  Editor = "editor",
  Viewer = "viewer",
}