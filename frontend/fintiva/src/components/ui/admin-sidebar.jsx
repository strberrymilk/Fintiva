import { memo } from "react";
import { Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  Activity,
  Database,
  Shield,
  Zap,
  Bell,
  Settings,
  User,
} from "lucide-react";
import Sprout from "@/components/Sprout";
import Apple from "@/components/Apple";
import BanknoteArrowDown from "@/components/BanknoteArrowDown";
import Medal from "@/components/Medal";

const menuItems = [
  { title: "Tablero", icon: LayoutDashboard, href: "/dashboard" },
  { title: "Analíticas", icon: BarChart3, href: "#analytics" },
  { title: "Fintivadores", icon: Users, href: "#users" },
  { title: "Parcelas", icon: Sprout, href: "/parcelas" },
  { title: "Cultivos", icon: Apple, href: "/cultivos" },
  { title: "Gastos", icon: BanknoteArrowDown, href: "/gastos" },
  { title: "Logros", icon: Medal, href: "/logros" },
  { title: "Notificaciones", icon: Bell, href: "#notifications" },
  { title: "Configuración", icon: Settings, href: "#settings" },
];

export const AdminSidebar = memo(() => {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#dashboard">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Oscar Aguilar</span>
                  <span className="truncate text-xs"></span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <Link to={item.href}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="#profile">
                <User />
                <span>Perfil</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
});

AdminSidebar.displayName = "AdminSidebar";