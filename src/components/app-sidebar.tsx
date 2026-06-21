import { Permissions } from "#/constants/permissions";
import { useAuthStore } from "#/store/authStore";
import { AudioLinesIcon, Calendar, GalleryVerticalEndIcon, LayoutDashboardIcon, Settings2Icon, TerminalIcon } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "./ui/sidebar";
import { AppBrand } from "./app-brand";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

const teams = [
  {
    name: "SIGLA",
    logo: <GalleryVerticalEndIcon />,
    plan: "v1.0",
  }
]


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, permissions } = useAuthStore();

  const canReadUsers = permissions.includes(Permissions.USERS_READ)
  const canReadRoles = permissions.includes(Permissions.ROLES_READ)
  const canReadPermissions = permissions.includes(Permissions.PERMISSIONS_READ)
  const canAccessManagement = canReadUsers || canReadRoles || canReadPermissions

  const accessManagementItems = [
    canReadUsers && { title: "Users", url: "/users" },
    canReadRoles && { title: "Roles", url: "/roles" },
    canReadPermissions && { title: "Permissions", url: "/permissions" },
  ].filter(Boolean) as { title: string; url: string }[]


  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Events",
      url: "/organizer/events",
      icon: <Calendar />,
    },
    ...(canAccessManagement ? [{
      title: "Access Management",
      url: "/#",
      icon: <Settings2Icon />,
      items: accessManagementItems,
    }] : []),
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppBrand teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}