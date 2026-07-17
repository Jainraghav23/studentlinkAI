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
  name: "create_community_post",
  title: "Create a community post",
  description:
    "Create a new post in the community feed as the signed-in alumni. Optionally scope to a group the user belongs to.",
  inputSchema: {
    content: z.string().trim().min(1).max(4000),
    group_id: z.string().uuid().optional().describe("Group to scope the post to (must be a member)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ content, group_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("posts")
      .insert({ user_id: ctx.getUserId(), content, group_id: group_id ?? null })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Post created: ${data.id}` }],
      structuredContent: { post: data },
    };
  },
});