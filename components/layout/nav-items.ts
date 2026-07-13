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
  { href: "/app/ajustes", label: "Ajustes", icon: Settings },
  { href: "/app/ayuda", label: "Ayuda", icon: HelpCircle },
];

// ─────────────────────────── Mobile bottom bar ───────────────────────────
// Five slots: three direct links plus two dropdown menus ("Diseña" and
// "Ajustes"). Between them they expose every desktop side-menu page on mobile.

export type MobileNavOption = {
  href: string;
  label: string;
  icon: LucideIcon;
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
      { href: "/app/ajustes", label: "Ajustes", icon: Settings },
      { href: "/app/ayuda", label: "Ayuda", icon: HelpCircle },
    ],
    showLogout: true,
  },
];
