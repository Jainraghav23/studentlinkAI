import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DigestData {
  newAlumni: Array<{ full_name: string; graduation_year: number; company: string | null; job_title: string | null }>;
  upcomingEvents: Array<{ title: string; event_date: string; location: string; description: string }>;
  topPosts: Array<{ content: string; author_name: string; like_count: number; comment_count: number }>;
  periodLabel: string;
}

async function compileDigest(supabase: ReturnType<typeof createClient>): Promise<DigestData> {
  const since = new Date();
  since.setMonth(since.getMonth() - 1);
  const sinceIso = since.toISOString();

  // 1. New alumni (claimed profiles created in the last month)
  const { data: alumniData } = await supabase
    .from("alumni_profiles")
    .select("full_name, graduation_year, company, job_title, created_at")
    .gte("created_at", sinceIso)
    .eq("claimed", true)
    .order("created_at", { ascending: false })
    .limit(10);

  // 2. Upcoming approved events (next 30 days)
  const now = new Date().toISOString();
  const in30 = new Date();
  in30.setDate(in30.getDate() + 30);
  const { data: eventsData } = await supabase
    .from("events")
    .select("title, event_date, location, description")
    .eq("status", "approved")
    .gte("event_date", now)
    .lte("event_date", in30.toISOString())
    .order("event_date", { ascending: true })
    .limit(5);

  // 3. Top posts from the last month, ranked by likes
  const { data: postsData } = await supabase
    .from("posts")
    .select("id, content, user_id, created_at")
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false })
    .limit(50);

  const postIds = (postsData || []).map((p: any) => p.id);
  const userIds = [...new Set((postsData || []).map((p: any) => p.user_id))];

  const [{ data: likesData }, { data: commentsData }, { data: profilesData }] = await Promise.all([
    supabase.from("likes").select("post_id").in("post_id", postIds.length ? postIds : ["00000000-0000-0000-0000-000000000000"]),
    supabase.from("comments").select("post_id").in("post_id", postIds.length ? postIds : ["00000000-0000-0000-0000-000000000000"]),
    supabase.from("alumni_profiles_public" as any).select("user_id, full_name").in("user_id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]),
  ]);

  const likeCounts = new Map<string, number>();
  (likesData as any[] || []).forEach((l) => likeCounts.set(l.post_id, (likeCounts.get(l.post_id) || 0) + 1));
  const commentCounts = new Map<string, number>();
  (commentsData as any[] || []).forEach((c) => commentCounts.set(c.post_id, (commentCounts.get(c.post_id) || 0) + 1));
  const nameMap = new Map<string, string>();
  (profilesData as any[] || []).forEach((p) => nameMap.set(p.user_id, p.full_name));

  const topPosts = (postsData || [])
    .map((p: any) => ({
      content: p.content,
      author_name: nameMap.get(p.user_id) || "An alum",
      like_count: likeCounts.get(p.id) || 0,
      comment_count: commentCounts.get(p.id) || 0,
    }))
    .sort((a, b) => b.like_count + b.comment_count - (a.like_count + a.comment_count))
    .slice(0, 5);

  const periodLabel = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return {
    newAlumni: (alumniData as any[]) || [],
    upcomingEvents: (eventsData as any[]) || [],
    topPosts,
    periodLabel,
  };
}

function renderHtml(data: DigestData, siteUrl: string): string {
  const alumniHtml = data.newAlumni.length
    ? data.newAlumni
        .map(
          (a) => `<li style="margin-bottom:8px;"><strong>${a.full_name}</strong> (Class of ${a.graduation_year})${a.job_title ? ` — ${a.job_title}` : ""}${a.company ? ` at ${a.company}` : ""}</li>`,
        )
        .join("")
    : "<li>No new alumni this month.</li>";

  const eventsHtml = data.upcomingEvents.length
    ? data.upcomingEvents
        .map((e) => {
          const d = new Date(e.event_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
          return `<li style="margin-bottom:12px;"><strong>${e.title}</strong><br/><span style="color:#666;">${d} • ${e.location}</span></li>`;
        })
        .join("")
    : "<li>No upcoming events scheduled.</li>";

  const postsHtml = data.topPosts.length
    ? data.topPosts
        .map(
          (p) => `<li style="margin-bottom:12px;"><em>"${p.content.slice(0, 140)}${p.content.length > 140 ? "…" : ""}"</em><br/><span style="color:#666;">— ${p.author_name} • ${p.like_count} likes • ${p.comment_count} comments</span></li>`,
        )
        .join("")
    : "<li>No community posts yet — be the first!</li>";

  return `<!DOCTYPE html>
<html><body style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <div style="background: linear-gradient(135deg, hsl(0, 73%, 35%), hsl(0, 73%, 25%)); padding: 32px 24px; border-radius: 12px; color: white; text-align: center;">
    <h1 style="margin:0; font-size: 24px;">Erdman Alumni Digest</h1>
    <p style="margin: 8px 0 0; opacity: 0.9;">${data.periodLabel}</p>
  </div>
  <h2 style="margin-top: 32px; border-bottom: 2px solid hsl(0, 73%, 35%); padding-bottom: 8px;">👋 New Alumni</h2>
  <ul style="padding-left: 20px;">${alumniHtml}</ul>
  <h2 style="margin-top: 32px; border-bottom: 2px solid hsl(0, 73%, 35%); padding-bottom: 8px;">📅 Upcoming Events</h2>
  <ul style="padding-left: 20px;">${eventsHtml}</ul>
  <h2 style="margin-top: 32px; border-bottom: 2px solid hsl(0, 73%, 35%); padding-bottom: 8px;">💬 Top Community Posts</h2>
  <ul style="padding-left: 20px;">${postsHtml}</ul>
  <div style="text-align: center; margin-top: 40px;">
    <a href="${siteUrl}" style="display: inline-block; background: hsl(0, 73%, 35%); color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Visit the Directory</a>
  </div>
  <p style="text-align: center; color: #999; font-size: 12px; margin-top: 32px;">You're receiving this because you're part of the Erdman Alumni Community.</p>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const url = new URL(req.url);
    const previewOnly = url.searchParams.get("preview") === "true";

    const data = await compileDigest(supabase);
    const siteUrl = "https://erdmanalumni.lovable.app";
    const html = renderHtml(data, siteUrl);
    const subject = `Erdman Alumni Digest — ${data.periodLabel}`;

    if (previewOnly) {
      return new Response(JSON.stringify({ subject, html, data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // TODO: Once email domain is verified, wire up sending here.
    // Fetch all recipients from auth.users via admin API and call send-transactional-email per user.
    // Example skeleton (commented until ready):
    //
    // const { data: users } = await supabase.auth.admin.listUsers();
    // for (const user of users.users) {
    //   if (!user.email) continue;
    //   await supabase.functions.invoke("send-transactional-email", {
    //     body: { to: user.email, subject, html },
    //   });
    // }

    return new Response(
      JSON.stringify({
        ok: true,
        message: "Digest compiled. Email sending not yet wired — verify email domain first.",
        subject,
        stats: {
          newAlumni: data.newAlumni.length,
          upcomingEvents: data.upcomingEvents.length,
          topPosts: data.topPosts.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("monthly-digest error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});