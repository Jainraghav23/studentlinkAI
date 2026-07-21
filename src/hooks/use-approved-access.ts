import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/use-admin";

export const useApprovedAccess = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      if (authLoading || adminLoading) return;

      if (!user) {
        if (isMounted) {
          setIsApproved(false);
          setLoading(false);
        }
        return;
      }

      if (isAdmin) {
        if (isMounted) {
          setIsApproved(true);
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
  }, [adminLoading, authLoading, isAdmin, user]);

  return { loading: authLoading || adminLoading || loading, isApproved };
};
