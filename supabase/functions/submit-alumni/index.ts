import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiting (per function instance)
// In production, you'd use Redis or a database table for distributed rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour window
const MAX_REQUESTS_PER_WINDOW = 5; // Max 5 submissions per hour per IP

function isRateLimited(clientIP: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(clientIP);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIP, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.count++;
  return false;
}

// Validation functions
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 320;
}

function validateString(
  value: string | null | undefined,
  maxLength: number
): boolean {
  if (value === null || value === undefined || value === "") return true;
  return typeof value === "string" && value.length <= maxLength;
}

function validateGraduationYear(year: number): boolean {
  const currentYear = new Date().getFullYear();
  return year >= 1900 && year <= currentYear + 10;
}

function sanitizeString(value: string | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;
  // Trim whitespace and remove any control characters
  return value.trim().replace(/[\x00-\x1F\x7F]/g, "");
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Get client IP for rate limiting
    const clientIP =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    console.log(`Submission attempt from IP: ${clientIP}`);

    // Check rate limit
    if (isRateLimited(clientIP)) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({
          error:
            "Too many submissions. Please try again later (max 5 per hour).",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.json();
    console.log("Received submission data:", {
      full_name: body.full_name,
      email: body.email,
      graduation_year: body.graduation_year,
    });

    // Validate required fields
    if (!body.full_name || !body.email || !body.graduation_year) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate email format
    if (!validateEmail(body.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format or too long" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate graduation year
    if (!validateGraduationYear(body.graduation_year)) {
      return new Response(
        JSON.stringify({ error: "Invalid graduation year" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate string lengths
    if (!validateString(body.full_name, 200)) {
      return new Response(JSON.stringify({ error: "Name is too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!validateString(body.bio, 2000)) {
      return new Response(JSON.stringify({ error: "Bio is too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!validateString(body.job_title, 200)) {
      return new Response(JSON.stringify({ error: "Job title is too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!validateString(body.company, 200)) {
      return new Response(
        JSON.stringify({ error: "Company name is too long" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!validateString(body.location, 200)) {
      return new Response(JSON.stringify({ error: "Location is too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!validateString(body.linkedin_url, 500)) {
      return new Response(
        JSON.stringify({ error: "LinkedIn URL is too long" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Honeypot check - if 'website' field is filled, it's likely a bot
    if (body.website) {
      console.log(`Honeypot triggered for IP: ${clientIP}`);
      // Return success to not alert the bot, but don't actually insert
      return new Response(
        JSON.stringify({ success: true, message: "Submission received" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for duplicate email submissions (pending)
    const { data: existingSubmission } = await supabase
      .from("alumni_submissions")
      .select("id")
      .eq("email", body.email.toLowerCase().trim())
      .eq("status", "pending")
      .single();

    if (existingSubmission) {
      return new Response(
        JSON.stringify({
          error:
            "A pending submission with this email already exists. Please wait for it to be reviewed.",
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Sanitize and insert submission
    const { error } = await supabase.from("alumni_submissions").insert({
      full_name: sanitizeString(body.full_name),
      email: body.email.toLowerCase().trim(),
      graduation_year: body.graduation_year,
      job_title: sanitizeString(body.job_title),
      company: sanitizeString(body.company),
      location: sanitizeString(body.location),
      specialization: sanitizeString(body.specialization),
      linkedin_url: sanitizeString(body.linkedin_url),
      bio: sanitizeString(body.bio),
      candidate_type: body.candidate_type === "international" ? "international" : "domestic",
      country: body.candidate_type === "international" ? sanitizeString(body.country) : null,
    });

    if (error) {
      console.error("Database insert error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to submit profile" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Submission successful for email: ${body.email}`);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Your profile has been submitted for review!",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing submission:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
