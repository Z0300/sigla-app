export const Permissions = {
  // Users
  USERS_READ: "users:read",
  USERS_CREATE: "users:create",
  USERS_UPDATE: "users:update",
  USERS_DELETE: "users:delete",
  // Roles
  ROLES_READ: "roles:read",
  ROLES_CREATE: "roles:create",
  ROLES_UPDATE: "roles:update",
  ROLES_DELETE: "roles:delete",
  // Permissions
  PERMISSIONS_READ: "permissions:read",
  PERMISSIONS_CREATE: "permissions:create",
  PERMISSIONS_UPDATE: "permissions:update",
  PERMISSIONS_DELETE: "permissions:delete",
  // Profile
  PROFILE_READ: "profile:read",
  PROFILE_UPDATE: "profile:update",

  // Events
  EVENTS_READ: "events:read",
  EVENTS_CREATE: "events:create",
  EVENTS_UPDATE: "events:update",
  EVENTS_DELETE: "events:delete",
} as const;

export const Roles = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  ORGANIZER: "ORGANIZER",
} as const;
