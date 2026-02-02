import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ProfileStatus {
  isLoading: boolean;
  isActive: boolean;
  isPremium: boolean;
}

export const useProfileStatus = (): ProfileStatus => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const fetchProfileStatus = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_active, is_premium")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile status:", error);
          setIsLoading(false);
          return;
        }

        if (data) {
          setIsActive(data.is_active || false);
          setIsPremium(data.is_premium || false);
        }
      } catch (error) {
        console.error("Error fetching profile status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileStatus();
  }, [user]);

  return {
    isLoading,
    isActive,
    isPremium,
  };
};
