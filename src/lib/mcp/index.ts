import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchAlumniTool from "./tools/search-alumni";
import getMyProfileTool from "./tools/get-my-profile";
import listEventsTool from "./tools/list-events";
import listReferralsTool from "./tools/list-referrals";
import listGroupsTool from "./tools/list-groups";
import createCommunityPostTool from "./tools/create-community-post";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "erdman-alumni-mcp",
  title: "Erdman Alumni MCP",
  version: "0.1.0",
  instructions:
    "Tools for the Erdman Alumni network. Search alumni, view your own profile, list upcoming events, browse job referrals, discover groups, and post to the community feed. All calls act as the signed-in alumni user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    searchAlumniTool,
    getMyProfileTool,
    listEventsTool,
    listReferralsTool,
    listGroupsTool,
    createCommunityPostTool,
  ],
});