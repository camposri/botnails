import { useState, useEffect } from "react";
import { differenceInDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface TrialStatus {
  isLoading: boolean;
  isPremium: boolean;
  daysRemaining: number;
  isExpired: boolean;
  trialEndsAt: Date | null;
}

export const useTrialStatus = (): TrialStatus => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null);

  useEffect(() => {
    const fetchTrialStatus = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("trial_ends_at, is_premium")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching trial status:", error);
          setIsLoading(false);
          return;
        }

        if (data) {
          setIsPremium(data.is_premium || false);
          setTrialEndsAt(data.trial_ends_at ? new Date(data.trial_ends_at) : null);
        }
      } catch (error) {
        console.error("Error fetching trial status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrialStatus();
  }, [user]);

  const daysRemaining = trialEndsAt
    ? differenceInDays(trialEndsAt, new Date())
    : 0;

  const isExpired = daysRemaining < 0;

  return {
    isLoading,
    isPremium,
    daysRemaining,
    isExpired,
    trialEndsAt,
  };
};
