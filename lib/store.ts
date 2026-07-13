"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Proposal, ProposalItem, RoomAnswers, AiRecommendationSet } from "@/types";
import { supabase } from "@/lib/supabase";

interface DraftState {
  photo: string | null;
  answers: RoomAnswers | null;
  recommendation: AiRecommendationSet | null;
  selectedItems: ProposalItem[];
  setPhoto: (photo: string | null) => void;
  setAnswers: (answers: RoomAnswers) => void;
  setRecommendation: (rec: AiRecommendationSet | null) => void;
  toggleSelectedPlant: (plantId: string) => void;
  updateItem: (plantId: string, patch: Partial<ProposalItem>) => void;
  resetDraft: () => void;
}

export const useDraftStore = create<DraftState>((set, get) => ({
  photo: null,
  answers: null,
  recommendation: null,
  selectedItems: [],
  setPhoto: (photo) => set({ photo }),
  setAnswers: (answers) => set({ answers }),
  setRecommendation: (recommendation) => set({ recommendation }),
  toggleSelectedPlant: (plantId) => {
    const current = get().selectedItems;
    const exists = current.find((i) => i.plantId === plantId);
    if (exists) {
      set({ selectedItems: current.filter((i) => i.plantId !== plantId) });
    } else {
      set({
        selectedItems: [...current, { plantId, decorationIds: [] }],
      });
    }
  },
  updateItem: (plantId, patch) => {
    set({
      selectedItems: get().selectedItems.map((i) =>
        i.plantId === plantId ? { ...i, ...patch } : i
      ),
    });
  },
  resetDraft: () =>
    set({ photo: null, answers: null, recommendation: null, selectedItems: [] }),
}));

import type { AccessoryCategory } from "@/data/accessories";

export type SavedItemKind = "plant" | "planter" | "accesorio";

export interface SavedPlant {
  id: string;
  kind?: SavedItemKind;
  accessoryCategory?: AccessoryCategory;
  name: string;
  scientificName?: string;
  subtitle?: string;
  image: string;
  priceQ: number;
  light?: string;
  href?: string;
  swatch?: string;
  iconKey?: string;
  savedAt: string;
}

interface SavedState {
  saved: SavedPlant[];
  toggle: (plant: Omit<SavedPlant, "savedAt">) => void;
  add: (plant: Omit<SavedPlant, "savedAt">) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      saved: [],
      toggle: (plant) => {
        const exists = get().saved.some((p) => p.id === plant.id);
        if (exists) {
          set({ saved: get().saved.filter((p) => p.id !== plant.id) });
        } else {
          set({
            saved: [
              { ...plant, savedAt: new Date().toISOString() },
              ...get().saved,
            ],
          });
        }
      },
      add: (plant) => {
        if (get().saved.some((p) => p.id === plant.id)) return;
        set({
          saved: [
            { ...plant, savedAt: new Date().toISOString() },
            ...get().saved,
          ],
        });
      },
      remove: (id) => set({ saved: get().saved.filter((p) => p.id !== id) }),
      clear: () => set({ saved: [] }),
    }),
    { name: "verdea_saved_plants" }
  )
);

export interface CartItem {
  id: string;
  kind: "plant" | "planter" | "creacion" | "accesorio" | "propuesta";
  name: string;
  subtitle?: string;
  image: string;
  priceQ: number;
  qty: number;
  components?: CreationComponent[];
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item, qty = 1) => {
        const existing = get().items.find((i) => i.id === item.id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === item.id ? { ...i, qty: i.qty + qty } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, qty }] });
        }
      },
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      setQty: (id, qty) => {
        if (qty <= 0) {
          set({ items: get().items.filter((i) => i.id !== id) });
          return;
        }
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, qty } : i)),
        });
      },
      clear: () => set({ items: [] }),
    }),
    { name: "verdea_cart" }
  )
);

export interface OrderItem {
  id: string;
  kind?: CartItem["kind"];
  name: string;
  subtitle?: string;
  image?: string;
  priceQ: number;
  qty: number;
  components?: CreationComponent[];
}

export interface Order {
  id: string;
  items: OrderItem[];
  totalQ: number;
  createdAt: string;
  status: "pagado";
  customerName?: string;
  customerEmail?: string;
}

interface OrdersState {
  orders: Order[];
  addOrder: (order: Order) => void;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => set({ orders: [order, ...get().orders] }),
    }),
    { name: "verdea_orders" }
  )
);

export interface CreationComponent {
  label: string;
  name: string;
  priceQ: number;
  image?: string;
  description?: string;
}

export interface Creation {
  id: string;
  name: string;
  image: string;
  totalQ: number;
  components: CreationComponent[];
  saucerId?: string | null;
  planterId?: string | null;
  soilId?: string | null;
  mulchId?: string | null;
  plantId?: string;
  createdAt: string;
}

interface CreationsState {
  creations: Creation[];
  add: (creation: Creation) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useCreationsStore = create<CreationsState>()(
  persist(
    (set, get) => ({
      creations: [],
      add: (creation) => set({ creations: [creation, ...get().creations] }),
      remove: (id) =>
        set({ creations: get().creations.filter((c) => c.id !== id) }),
      clear: () => set({ creations: [] }),
    }),
    { name: "verdea_creations" }
  )
);

interface ProposalsState {
  proposals: Proposal[];
  saveProposal: (proposal: Proposal) => void;
  deleteProposal: (id: string) => void;
  duplicateProposal: (id: string) => void;
}

export const useProposalsStore = create<ProposalsState>()(
  persist(
    (set, get) => ({
      proposals: [],
      saveProposal: (proposal) =>
        set({ proposals: [proposal, ...get().proposals.filter((p) => p.id !== proposal.id)] }),
      deleteProposal: (id) =>
        set({ proposals: get().proposals.filter((p) => p.id !== id) }),
      duplicateProposal: (id) => {
        const original = get().proposals.find((p) => p.id === id);
        if (!original) return;
        const copy: Proposal = {
          ...original,
          id: `prop_${Date.now()}`,
          name: `${original.name} (copia)`,
          createdAt: new Date().toISOString(),
          status: "borrador",
        };
        set({ proposals: [copy, ...get().proposals] });
      },
    }),
    { name: "verdea_proposals" }
  )
);

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  workspace: string;
  avatarUrl: string | null;
}

export interface UserSettings {
  emailNotifications: boolean;
  orderUpdates: boolean;
  designTips: boolean;
  marketingEmails: boolean;
  petFriendlyDefault: boolean;
  lowMaintenanceDefault: boolean;
}

interface ProfileState {
  profile: UserProfile;
  updateProfile: (patch: Partial<UserProfile>) => void;
}

interface SettingsState {
  settings: UserSettings;
  updateSettings: (patch: Partial<UserSettings>) => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Franz Hentze",
  email: "franz@nutri-tech.com.au",
  phone: "",
  workspace: "Work",
  avatarUrl: null,
};

const DEFAULT_SETTINGS: UserSettings = {
  emailNotifications: true,
  orderUpdates: true,
  designTips: true,
  marketingEmails: false,
  petFriendlyDefault: false,
  lowMaintenanceDefault: true,
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      updateProfile: (patch) =>
        set({ profile: { ...get().profile, ...patch } }),
    }),
    { name: "verdea_profile" }
  )
);

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (patch) =>
        set({ settings: { ...get().settings, ...patch } }),
    }),
    { name: "verdea_settings" }
  )
);

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  login: (email?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      email: null,
      login: (email) => set({ isAuthenticated: true, email: email ?? null }),
      logout: () => {
        void supabase.auth.signOut();
        set({ isAuthenticated: false, email: null });
      },
    }),
    { name: "verdea_auth" }
  )
);

export function getProfileInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "V";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
