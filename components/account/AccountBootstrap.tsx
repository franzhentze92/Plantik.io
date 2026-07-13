"use client";

import { useEffect } from "react";
import { getOrCreateSessionId } from "@/lib/session";
import { getProfileBySession, upsertProfile } from "@/lib/supabase/account";
import { useProfileStore, useSettingsStore } from "@/lib/store";

export function AccountBootstrap() {
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const localProfile = useProfileStore((s) => s.profile);
  const localSettings = useSettingsStore((s) => s.settings);

  useEffect(() => {
    let active = true;

    async function sync() {
      const sessionId = getOrCreateSessionId();
      const remote = await getProfileBySession(sessionId);

      if (!active) return;

      if (remote) {
        updateProfile({
          name: remote.name,
          email: remote.email,
          phone: remote.phone,
          workspace: remote.workspace,
          avatarUrl: remote.avatarUrl,
        });
        updateSettings(remote.settings);
      } else {
        // Seed Supabase from local defaults on first visit.
        try {
          await upsertProfile(sessionId, {
            ...localProfile,
            settings: localSettings,
          });
        } catch (err) {
          console.error("Error seeding profile:", err);
        }
      }
    }

    sync();
    return () => {
      active = false;
    };
    // Run once on mount — local store is the seed source for first sync only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
