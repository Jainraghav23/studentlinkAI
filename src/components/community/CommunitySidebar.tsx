import { Link, useLocation } from "react-router-dom";
import { Users, Home, MessageSquare, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PostForm } from "@/components/posts/PostForm";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: MessageSquare, label: "Community", href: "/community" },
  { icon: Users, label: "Directory", href: "/#directory" },
];

export function CommunitySidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const allNavItems = [
    ...navigationItems,
    ...(user ? [{ icon: User, label: "My Profile", href: "/my-profile" }] : []),
  ];

  const isActive = (href: string) => {
    if (href === "/community") return location.pathname === "/community";
    if (href === "/") return location.pathname === "/" && !location.hash;
    return location.pathname === href;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-sidebar-foreground">
            Community
          </h2>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {allNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isCollapsed && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Create Post</SidebarGroupLabel>
              <SidebarGroupContent>
                {user ? (
                  <div className="px-2">
                    <PostForm
                      onPostCreated={() =>
                        queryClient.invalidateQueries({ queryKey: ["posts"] })
                      }
                    />
                  </div>
                ) : (
                  <div className="p-4 bg-muted rounded-lg text-center mx-2">
                    <p className="text-sm text-muted-foreground mb-3">
                      Log in to create posts
                    </p>
                    <Button asChild size="sm" className="w-full">
                      <Link to="/auth">Log In</Link>
                    </Button>
                  </div>
                )}
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
