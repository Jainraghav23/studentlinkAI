import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "search_alumni",
  title: "Search alumni directory",
  description:
    "Search the alumni directory by name, company, specialization, graduation year, location, or candidate type. Returns non-sensitive public profile fields.",
  inputSchema: {
    query: z.string().optional().describe("Free-text match against name, company, job title, or bio."),
    graduation_year: z.number().int().optional(),
    specialization: z.string().optional(),
    location: z.string().optional(),
    candidate_type: z.enum(["Domestic", "International"]).optional(),
    limit: z.number().int().min(1).max(50).optional().describe("Max rows to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, graduation_year, specialization, location, candidate_type, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const sb = supabaseForUser(ctx);
    let q = sb.from("alumni_profiles_public").select("*").limit(limit ?? 20);
    if (graduation_year) q = q.eq("graduation_year", graduation_year);
    if (specialization) q = q.eq("specialization", specialization);
    if (location) q = q.ilike("location", `%${location}%`);
    if (candidate_type) q = q.eq("candidate_type", candidate_type);
    if (query) {
      q = q.or(
        `full_name.ilike.%${query}%,company.ilike.%${query}%,job_title.ilike.%${query}%,bio.ilike.%${query}%`,
      );
    }
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { rows: data ?? [] },
    };
  },
});