import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";

interface UserProfile {
  role: 'customer' | 'teacher' | 'admin';
  full_name: string | null;
  is_active?: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'customer' | 'teacher' | 'admin' | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const forceSignOut = async () => {
    // Clean up subscriptions first
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setUser(null);
    setSession(null);
    setUserRole(null);
    await supabase.auth.signOut();
    toast.error("تم تعطيل حسابك من قبل الإدارة.");
  };

  const checkIsActive = async (userId: string): Promise<boolean> => {
    const { data } = await supabase
      .from('profiles')
      .select('is_active')
      .eq('id', userId)
      .single();
    return data?.is_active !== false; // treat null/undefined as active
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, full_name, is_active')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setUserRole(null);
      } else {
        if (data?.is_active === false) {
          await forceSignOut();
        } else {
          setUserRole(data?.role || 'customer');
          // Start real-time listener for this user's profile
          startRealtimeWatch(userId);
          // Start polling fallback
          startPolling(userId);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  const startRealtimeWatch = (userId: string) => {
    // Remove existing channel if any
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
    }

    const channel = supabase
      .channel(`profile-active-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        async (payload) => {
          const updated = payload.new as any;
          if (updated?.is_active === false) {
            await forceSignOut();
          }
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;
  };

  const startPolling = (userId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(async () => {
      const active = await checkIsActive(userId);
      if (!active) {
        await forceSignOut();
      }
    }, 30000); // check every 30 seconds
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setUserRole(null);
          setLoading(false);
          // Clean up on sign out
          if (realtimeChannelRef.current) {
            supabase.removeChannel(realtimeChannelRef.current);
            realtimeChannelRef.current = null;
          }
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      if (realtimeChannelRef.current) supabase.removeChannel(realtimeChannelRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // Immediately check if the account is active after login
    if (data?.user) {
      const active = await checkIsActive(data.user.id);
      if (!active) {
        await supabase.auth.signOut();
        throw new Error("تم تعطيل هذا الحساب. تواصل مع الإدارة.");
      }
    }

    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return { user, session, loading, userRole, signIn, signUp, signOut };
}
