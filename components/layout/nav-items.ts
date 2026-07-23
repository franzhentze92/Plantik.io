import {
  Home,
  Leaf,
  Camera,
  Layers,
  BookMarked,
  Package,
  ShoppingCart,
  User,
  Settings,
  HelpCircle,
  Wand2,
  Shield,
  LayoutGrid,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export const navItems = [
  { href: "/app", label: "Inicio", icon: Home },
  { href: "/app/plantas", label: "Explorar catálogo", icon: Leaf },
  { href: "/app/disena-tu-espacio", label: "Diseña tu espacio", icon: Camera },
  { href: "/app/arma-tu-planta", label: "Arma tu planta", icon: Layers },
  { href: "/app/propuestas", label: "Mis propuestas", icon: BookMarked },
  { href: "/app/pedidos", label: "Mis pedidos", icon: Package },
  { href: "/app/carrito", label: "Carrito", icon: ShoppingCart },
  { href: "/app/perfil", label: "Mi perfil", icon: User },
  { href: "/app/ayuda", label: "Ayuda", icon: HelpCircle },
];

export const adminNavItems = [
  { href: "/app/admin/pedidos", label: "Pedidos", icon: Package },
  { href: "/app/admin/catalogo", label: "Catálogo", icon: LayoutGrid },
  { href: "/app/admin/usuarios", label: "Usuarios", icon: User },
  { href: "/app/admin/analiticas", label: "Analíticas", icon: BarChart3 },
];

// ─────────────────────────── Mobile bottom bar ───────────────────────────
// Five slots: three direct links plus two dropdown menus ("Diseña" and
// "Ajustes"). Between them they expose every desktop side-menu page on mobile.

export type MobileNavOption = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

export type MobileNavTab =
  | { kind: "link"; href: string; icon: LucideIcon; shortLabel: string }
  | {
      kind: "menu";
      id: string;
      icon: LucideIcon;
      shortLabel: string;
      options: MobileNavOption[];
      showLogout?: boolean;
    };

export const mobileNavTabs: MobileNavTab[] = [
  { kind: "link", href: "/app", icon: Home, shortLabel: "Inicio" },
  { kind: "link", href: "/app/plantas", icon: Leaf, shortLabel: "Explorar" },
  {
    kind: "menu",
    id: "disena",
    icon: Wand2,
    shortLabel: "Diseña",
    options: [
      { href: "/app/disena-tu-espacio", label: "Subir una foto", icon: Camera },
      { href: "/app/arma-tu-planta", label: "Armar mi planta", icon: Layers },
    ],
  },
  {
    kind: "link",
    href: "/app/propuestas",
    icon: BookMarked,
    shortLabel: "Propuestas",
  },
  {
    kind: "menu",
    id: "ajustes",
    icon: Settings,
    shortLabel: "Ajustes",
    options: [
      { href: "/app/carrito", label: "Carrito", icon: ShoppingCart },
      { href: "/app/pedidos", label: "Mis pedidos", icon: Package },
      { href: "/app/perfil", label: "Mi perfil", icon: User },
      { href: "/app/ayuda", label: "Ayuda", icon: HelpCircle },
      { href: "/app/admin/pedidos", label: "Admin · Pedidos", icon: Shield, adminOnly: true },
      { href: "/app/admin/catalogo", label: "Admin · Catálogo", icon: LayoutGrid, adminOnly: true },
      { href: "/app/admin/usuarios", label: "Admin · Usuarios", icon: User, adminOnly: true },
      { href: "/app/admin/analiticas", label: "Admin · Analíticas", icon: BarChart3, adminOnly: true },
    ],
    showLogout: true,
  },
];
