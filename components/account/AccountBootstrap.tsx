"use client";

import { useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  accountOwnerIdFromUserId,
  getBrowserSessionId,
} from "@/lib/session";
import {
  getProfileBySession,
  migrateGuestAccountToUser,
  upsertProfile,
} from "@/lib/supabase/account";
import { useAuthStore, useProfileStore, useSettingsStore } from "@/lib/store";

async function syncAccount(user: User | null) {
  const updateProfile = useProfileStore.getState().updateProfile;
  const updateSettings = useSettingsStore.getState().updateSettings;
  const login = useAuthStore.getState().login;

  if (user) {
    login(user.email ?? undefined);
    const ownerId = accountOwnerIdFromUserId(user.id);
    const guestId = getBrowserSessionId();

    let remote = await migrateGuestAccountToUser(
      guestId,
      ownerId,
      user.email
    );

    if (!remote) {
      const local = useProfileStore.getState().profile;
      remote = await upsertProfile(ownerId, {
        name: local.name || "",
        email: user.email || local.email || "",
        phone: local.phone || "",
        workspace: local.workspace || "Casa",
        avatarUrl: local.avatarUrl,
        settings: useSettingsStore.getState().settings,
      });
    }

    updateProfile({
      name: remote.name,
      email: user.email || remote.email,
      phone: remote.phone,
      workspace: remote.workspace,
      avatarUrl: remote.avatarUrl,
    });
    updateSettings(remote.settings);
    return;
  }

  // Guest: keep using the browser session profile.
  const guestId = getBrowserSessionId();
  const remote = await getProfileBySession(guestId);
  if (remote) {
    updateProfile({
      name: remote.name,
      email: remote.email,
      phone: remote.phone,
      workspace: remote.workspace,
      avatarUrl: remote.avatarUrl,
    });
    updateSettings(remote.settings);
  }
}

export function AccountBootstrap() {
  useEffect(() => {
    let active = true;

    async function run(user: User | null) {
      try {
        if (!active) return;
        await syncAccount(user);
      } catch (err) {
        console.error("Error syncing account:", err);
      }
    }

    supabase.auth.getUser().then(({ data }) => run(data.user));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      void run(session?.user ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return null;
}
