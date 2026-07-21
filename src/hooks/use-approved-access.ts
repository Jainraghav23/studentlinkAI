import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useApprovedAccess = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      if (authLoading) return;

      if (!user) {
        if (isMounted) {
          setIsApproved(false);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      const { data: ownedProfile } = await supabase
        .from("alumni_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      let hasApprovedProfile = Boolean(ownedProfile);

      if (!hasApprovedProfile && user.email) {
        const { data: claimableProfile } = await supabase
          .from("alumni_profiles")
          .select("id")
          .eq("email", user.email.toLowerCase())
          .eq("claimed", false)
          .is("user_id", null)
          .maybeSingle();

        hasApprovedProfile = Boolean(claimableProfile);
      }

      if (isMounted) {
        setIsApproved(hasApprovedProfile);
        setLoading(false);
      }
    };

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, [authLoading, user]);

  return { loading: authLoading || loading, isApproved };
};
