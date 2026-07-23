import { supabase } from "../supabase";
import { isPaidOrderStatus } from "@/lib/order-display";
import { formatAddressLine, type UserAddress, type UserPaymentCard } from "./account";
import type { Order } from "@/lib/store";

export interface AdminUserStats {
  total: number;
  withOrders: number;
  withAddresses: number;
  totalRevenueQ: number;
  avgSpentQ: number;
}

export interface AdminUserSummary {
  id: string;
  sessionId: string;
  name: string;
  email: string;
  phone: string;
  workspace: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  addressCount: number;
  defaultAddress: string | null;
  cardCount: number;
  orderCount: number;
  paidOrderCount: number;
  totalSpentQ: number;
  proposalCount: number;
  spaceCount: number;
  lastOrderAt: string | null;
}

export interface AdminUserOrder {
  id: string;
  status: Order["status"];
  totalQ: number;
  itemCount: number;
  createdAt: string;
}

export interface AdminUserDetail extends AdminUserSummary {
  addresses: UserAddress[];
  cards: UserPaymentCard[];
  orders: AdminUserOrder[];
  settings: Record<string, unknown>;
}

export interface AdminUsersFilter {
  search?: string;
  hasOrders?: boolean;
  hasSpending?: boolean;
  page?: number;
  limit?: number;
}

export interface AdminUsersResult {
  users: AdminUserSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: AdminUserStats;
}

interface DbProfileRow {
  session_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  workspace: string | null;
  avatar_url: string | null;
  settings: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

interface DbOrderRow {
  order_number: string;
  session_id: string;
  status: Order["status"];
  total_q: number;
  customer_email: string | null;
  items: unknown[];
  created_at: string;
}

export function userIdFromSessionId(sessionId: string): string {
  return sessionId.startsWith("user:") ? sessionId.slice(5) : sessionId;
}

export function sessionIdFromUserId(userId: string): string {
  return userId.startsWith("user:") ? userId : `user:${userId}`;
}

function mapProfileRow(
  row: DbProfileRow
): Omit<
  AdminUserSummary,
  | "addressCount"
  | "defaultAddress"
  | "cardCount"
  | "orderCount"
  | "paidOrderCount"
  | "totalSpentQ"
  | "proposalCount"
  | "spaceCount"
  | "lastOrderAt"
> {
  return {
    id: userIdFromSessionId(row.session_id),
    sessionId: row.session_id,
    name: row.name?.trim() || "Sin nombre",
    email: row.email?.trim() || "",
    phone: row.phone?.trim() || "",
    workspace: row.workspace?.trim() || "Casa",
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

type OrderStats = Pick<
  AdminUserSummary,
  | "orderCount"
  | "paidOrderCount"
  | "totalSpentQ"
  | "lastOrderAt"
>;

function computeOrderStats(
  sessionId: string,
  email: string,
  orders: DbOrderRow[]
): OrderStats {
  const relevant = orders.filter(
    (order) =>
      order.session_id === sessionId ||
      (email &&
        order.customer_email &&
        order.customer_email.toLowerCase() === email.toLowerCase())
  );

  let paidOrderCount = 0;
  let totalSpentQ = 0;
  let lastOrderAt: string | null = null;

  for (const order of relevant) {
    if (isPaidOrderStatus(order.status)) {
      paidOrderCount += 1;
      totalSpentQ += Number(order.total_q) || 0;
    }
    if (!lastOrderAt || order.created_at > lastOrderAt) {
      lastOrderAt = order.created_at;
    }
  }

  return {
    orderCount: relevant.length,
    paidOrderCount,
    totalSpentQ,
    lastOrderAt,
  };
}

function filterUsers(
  users: AdminUserSummary[],
  filters: AdminUsersFilter
): AdminUserSummary[] {
  const search = filters.search?.trim().toLowerCase();

  return users.filter((user) => {
    if (filters.hasOrders && user.orderCount === 0) return false;
    if (filters.hasSpending && user.totalSpentQ <= 0) return false;
    if (search) {
      const haystack = [user.name, user.email, user.phone, user.id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

function computeStats(users: AdminUserSummary[]): AdminUserStats {
  const withOrders = users.filter((u) => u.orderCount > 0).length;
  const withAddresses = users.filter((u) => u.addressCount > 0).length;
  const totalRevenueQ = users.reduce((sum, u) => sum + u.totalSpentQ, 0);
  const spenders = users.filter((u) => u.totalSpentQ > 0);

  return {
    total: users.length,
    withOrders,
    withAddresses,
    totalRevenueQ,
    avgSpentQ:
      spenders.length > 0 ? totalRevenueQ / spenders.length : 0,
  };
}

async function buildUserSummaries(): Promise<AdminUserSummary[]> {
  const [
    profilesResult,
    addressesResult,
    cardsResult,
    ordersResult,
    proposalsResult,
    spacesResult,
  ] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("*")
      .like("session_id", "user:%")
      .order("created_at", { ascending: false }),
    supabase.from("user_addresses").select("*").like("session_id", "user:%"),
    supabase.from("user_payment_cards").select("*").like("session_id", "user:%"),
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("proposals").select("session_id").like("session_id", "user:%"),
    supabase.from("spaces").select("session_id").like("session_id", "user:%"),
  ]);

  if (profilesResult.error) {
    console.error("Error fetching user profiles:", profilesResult.error);
    throw profilesResult.error;
  }

  const orders = (ordersResult.data ?? []) as DbOrderRow[];
  const addresses = (addressesResult.data ?? []) as UserAddress[];
  const cards = (cardsResult.data ?? []) as UserPaymentCard[];
  const proposals = proposalsResult.data ?? [];
  const spaces = spacesResult.data ?? [];

  const addressesBySession = new Map<string, UserAddress[]>();
  for (const address of addresses) {
    const list = addressesBySession.get(address.session_id) ?? [];
    list.push(address);
    addressesBySession.set(address.session_id, list);
  }

  const cardsBySession = new Map<string, UserPaymentCard[]>();
  for (const card of cards) {
    const list = cardsBySession.get(card.session_id) ?? [];
    list.push(card);
    cardsBySession.set(card.session_id, list);
  }

  const proposalCountBySession = new Map<string, number>();
  for (const row of proposals) {
    const sid = row.session_id as string;
    proposalCountBySession.set(sid, (proposalCountBySession.get(sid) ?? 0) + 1);
  }

  const spaceCountBySession = new Map<string, number>();
  for (const row of spaces) {
    const sid = row.session_id as string;
    spaceCountBySession.set(sid, (spaceCountBySession.get(sid) ?? 0) + 1);
  }

  return ((profilesResult.data ?? []) as DbProfileRow[]).map((row) => {
    const base = mapProfileRow(row);
    const userAddresses = addressesBySession.get(row.session_id) ?? [];
    const defaultAddress =
      userAddresses.find((a) => a.is_default) ?? userAddresses[0];
    const orderStats = computeOrderStats(
      row.session_id,
      base.email,
      orders
    );

    return {
      ...base,
      ...orderStats,
      addressCount: userAddresses.length,
      defaultAddress: defaultAddress
        ? formatAddressLine(defaultAddress)
        : null,
      cardCount: (cardsBySession.get(row.session_id) ?? []).length,
      proposalCount: proposalCountBySession.get(row.session_id) ?? 0,
      spaceCount: spaceCountBySession.get(row.session_id) ?? 0,
    };
  });
}

export async function getAllUsersAdmin(
  filters: AdminUsersFilter = {}
): Promise<AdminUsersResult> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 25));

  const allUsers = await buildUserSummaries();
  const stats = computeStats(allUsers);
  const filtered = filterUsers(allUsers, filters);
  const total = filtered.length;
  const offset = (page - 1) * limit;

  return {
    users: filtered.slice(offset, offset + limit),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
    stats,
  };
}

export async function getUserAdmin(userId: string): Promise<AdminUserDetail | null> {
  const sessionId = sessionIdFromUserId(userId);

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (profileError) {
    console.error("Error fetching user profile:", profileError);
    throw profileError;
  }

  if (!profile) return null;

  const email = (profile.email as string | null)?.trim() ?? "";

  const [addressesResult, cardsResult, ordersResult, proposalsResult, spacesResult] =
    await Promise.all([
      supabase
        .from("user_addresses")
        .select("*")
        .eq("session_id", sessionId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("user_payment_cards")
        .select("*")
        .eq("session_id", sessionId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false }),
      email
        ? supabase
            .from("orders")
            .select("*")
            .or(`session_id.eq.${sessionId},customer_email.ilike.${email}`)
            .order("created_at", { ascending: false })
        : supabase
            .from("orders")
            .select("*")
            .eq("session_id", sessionId)
            .order("created_at", { ascending: false }),
      supabase
        .from("proposals")
        .select("id", { count: "exact", head: true })
        .eq("session_id", sessionId),
      supabase
        .from("spaces")
        .select("id", { count: "exact", head: true })
        .eq("session_id", sessionId),
    ]);

  if (ordersResult.error) {
    console.error("Error fetching user orders:", ordersResult.error);
    throw ordersResult.error;
  }

  const base = mapProfileRow(profile as DbProfileRow);
  const addresses = (addressesResult.data ?? []) as UserAddress[];
  const cards = (cardsResult.data ?? []) as UserPaymentCard[];
  const orderStats = computeOrderStats(
    sessionId,
    base.email,
    (ordersResult.data ?? []) as DbOrderRow[]
  );

  const defaultAddress =
    addresses.find((a) => a.is_default) ?? addresses[0] ?? null;

  const orders: AdminUserOrder[] = ((ordersResult.data ?? []) as DbOrderRow[]).map(
    (order) => ({
      id: order.order_number,
      status: order.status,
      totalQ: Number(order.total_q) || 0,
      itemCount: Array.isArray(order.items)
        ? order.items.reduce<number>(
            (sum, item) =>
              sum + (Number((item as { qty?: number }).qty) || 1),
            0
          )
        : 0,
      createdAt: order.created_at,
    })
  );

  return {
    ...base,
    ...orderStats,
    addressCount: addresses.length,
    defaultAddress: defaultAddress ? formatAddressLine(defaultAddress) : null,
    cardCount: cards.length,
    proposalCount: proposalsResult.count ?? 0,
    spaceCount: spacesResult.count ?? 0,
    addresses,
    cards,
    orders,
    settings: (profile.settings as Record<string, unknown>) ?? {},
  };
}
