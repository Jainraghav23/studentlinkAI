import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ClaimableProfile {
  id: string;
  full_name: string;
  graduation_year: number;
  job_title: string | null;
  company: string | null;
  location: string | null;
  specialization: string | null;
  linkedin_url: string | null;
  email: string | null;
  bio: string | null;
  avatar_url: string | null;
}

export const useClaimableProfile = () => {
  const { user } = useAuth();
  const [claimableProfile, setClaimableProfile] = useState<ClaimableProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const checkForClaimableProfile = async () => {
    if (!user?.email) {
      setClaimableProfile(null);
      setLoading(false);
      return;
    }

    // First check if user already has a profile
    const { data: existingProfile } = await supabase
      .from("alumni_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existingProfile) {
      setClaimableProfile(null);
      setLoading(false);
      return;
    }

    // Check for unclaimed profile matching user's email
    const { data: unclaimed } = await supabase
      .from("alumni_profiles")
      .select("*")
      .eq("claimed", false)
      .ilike("email", user.email)
      .single();

    setClaimableProfile(unclaimed);
    setLoading(false);
  };

  useEffect(() => {
    checkForClaimableProfile();
  }, [user]);

  const claimProfile = async () => {
    if (!user || !claimableProfile) return false;

    setClaiming(true);
    try {
      const { error } = await supabase
        .from("alumni_profiles")
        .update({
          user_id: user.id,
          claimed: true,
          claim_token: null,
        })
        .eq("id", claimableProfile.id)
        .eq("claimed", false);

      if (error) throw error;

      setClaimableProfile(null);
      return true;
    } catch (error) {
      console.error("Failed to claim profile:", error);
      return false;
    } finally {
      setClaiming(false);
    }
  };

  return {
    claimableProfile,
    loading,
    claiming,
    claimProfile,
    refresh: checkForClaimableProfile,
  };
};
