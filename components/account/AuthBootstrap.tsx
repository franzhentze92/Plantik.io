"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore, useProfileStore } from "@/lib/store";

// Keeps the local auth store in sync with the real Supabase session so the
// UI (header, dashboard) reflects whether the user is actually signed in.
export function AuthBootstrap() {
  useEffect(() => {
    function apply(session: { user?: { email?: string | null } } | null) {
      if (session?.user) {
        const email = session.user.email ?? undefined;
        useAuthStore.getState().login(email);
        if (email) useProfileStore.getState().updateProfile({ email });
      } else {
        useAuthStore.setState({ isAuthenticated: false, email: null });
      }
    }

    supabase.auth.getSession().then(({ data }) => apply(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      apply(session);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return null;
}
