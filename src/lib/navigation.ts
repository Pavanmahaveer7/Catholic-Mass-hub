import {
  BookOpen,
  Church,
  Compass,
  HandHelping,
  MapPin,
  MonitorPlay,
  Store,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
};

export const mainNav: NavItem[] = [
  {
    title: "Find Mass",
    href: "/find",
    icon: Church,
    description: "Locate nearby parishes and worship times",
  },
  {
    title: "Daily Readings",
    href: "/readings",
    icon: BookOpen,
    description: "Official USCCB daily Bible readings",
  },
  {
    title: "Watch Online",
    href: "/watch",
    icon: MonitorPlay,
    description: "Live and on-demand Catholic Mass streams",
  },
  {
    title: "Prayers",
    href: "/prayers",
    icon: HandHelping,
    description: "Our Father, Hail Mary, Act of Contrition, and more",
  },
  {
    title: "Pilgrimages",
    href: "/pilgrimages",
    icon: Compass,
    description: "Sacred sites worldwide with travel guidance",
  },
  {
    title: "Teachings",
    href: "/teachings",
    icon: BookOpen,
    description: "Classic Roman Catholic catechesis",
  },
  {
    title: "Local Spots",
    href: "/places",
    icon: Store,
    description: "Catholic restaurants, pubs, and hangouts",
  },
];

export const mobileNav: NavItem[] = [
  mainNav[0],
  mainNav[1],
  mainNav[2],
  mainNav[3],
  {
    title: "More",
    href: "/places",
    icon: MapPin,
    description: "Pilgrimages, local spots, and more",
  },
];
