import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface Member {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  alumni_id: string | null;
}

export const GroupMembersList = ({ groupId }: { groupId: string }) => {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: rows } = await supabase
        .from("group_members" as any)
        .select("user_id")
        .eq("group_id", groupId)
        .order("joined_at", { ascending: true })
        .limit(20);
      const ids = (rows as any[] | null)?.map((r) => r.user_id) || [];
      if (ids.length === 0) {
        setMembers([]);
        return;
      }
      const { data: profiles } = await supabase
        .from("alumni_profiles_public" as any)
        .select("id, user_id, full_name, avatar_url")
        .in("user_id", ids);
      const map = new Map((profiles as any[] | null)?.map((p) => [p.user_id, p]) || []);
      setMembers(
        ids.map((uid) => ({
          user_id: uid,
          full_name: map.get(uid)?.full_name || "Alumni",
          avatar_url: map.get(uid)?.avatar_url || null,
          alumni_id: map.get(uid)?.id || null,
        }))
      );
    };
    load();
  }, [groupId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Members</CardTitle>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No members yet — be the first to join!</p>
        ) : (
          <ul className="space-y-2">
            {members.map((m) => {
              const initials = (m.full_name || "?")
                .split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
              const inner = (
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={m.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{m.full_name}</span>
                </div>
              );
              return (
                <li key={m.user_id}>
                  {m.alumni_id ? (
                    <Link to={`/alumni/${m.alumni_id}`} className="hover:opacity-80">
                      {inner}
                    </Link>
                  ) : inner}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};