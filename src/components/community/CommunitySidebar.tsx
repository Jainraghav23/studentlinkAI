import { Link, useLocation } from "react-router-dom";
import { Users, Home, MessageSquare, User, CalendarDays, Users2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PostForm } from "@/components/posts/PostForm";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  { icon: CalendarDays, label: "Events", href: "/events" },
  { icon: Users2, label: "Groups", href: "/groups" },
  { icon: Users, label: "Directory", href: "/#directory" },
];

export function CommunitySidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const { data: myGroups = [] } = useQuery({
    queryKey: ["my-groups", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data: memberships } = await supabase
        .from("group_members" as any)
        .select("group_id")
        .eq("user_id", user.id);
      const ids = (memberships as any[] | null)?.map((m) => m.group_id) || [];
      if (ids.length === 0) return [];
      const { data: groups } = await supabase
        .from("groups" as any)
        .select("id, name")
        .in("id", ids)
        .eq("status", "approved");
      return (groups as unknown as { id: string; name: string }[]) || [];
    },
    enabled: !!user?.id,
  });

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
            {user && myGroups.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel>My Groups</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {myGroups.map((g) => (
                      <SidebarMenuItem key={g.id}>
                        <SidebarMenuButton asChild tooltip={g.name}>
                          <Link to={`/groups/${g.id}`}>
                            <Users2 className="h-4 w-4" />
                            <span className="truncate">{g.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
            {user && myGroups.length > 0 && <SidebarSeparator />}
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
