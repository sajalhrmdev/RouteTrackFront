declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  export const MapPin: FC<SVGProps<SVGSVGElement>>;
  export const LayoutDashboard: FC<SVGProps<SVGSVGElement>>;
  export const Users: FC<SVGProps<SVGSVGElement>>;
  export const Building2: FC<SVGProps<SVGSVGElement>>;
  export const Briefcase: FC<SVGProps<SVGSVGElement>>;
  export const Route: FC<SVGProps<SVGSVGElement>>;
  export const FileBarChart: FC<SVGProps<SVGSVGElement>>;
  export const Bell: FC<SVGProps<SVGSVGElement>>;
  export const Settings: FC<SVGProps<SVGSVGElement>>;
  export const LogOut: FC<SVGProps<SVGSVGElement>>;
  export const ChevronLeft: FC<SVGProps<SVGSVGElement>>;
  export const ChevronRight: FC<SVGProps<SVGSVGElement>>;
  export const Clock: FC<SVGProps<SVGSVGElement>>;
  export const UserCircle: FC<SVGProps<SVGSVGElement>>;
  export const Search: FC<SVGProps<SVGSVGElement>>;
  export const Plus: FC<SVGProps<SVGSVGElement>>;
  export const Edit2: FC<SVGProps<SVGSVGElement>>;
  export const Trash2: FC<SVGProps<SVGSVGElement>>;
  export const MoreHorizontal: FC<SVGProps<SVGSVGElement>>;
  export const UserPlus: FC<SVGProps<SVGSVGElement>>;
  export const Map: FC<SVGProps<SVGSVGElement>>;
  export const UserCheck: FC<SVGProps<SVGSVGElement>>;
  export const UserX: FC<SVGProps<SVGSVGElement>>;
  export const TrendingUp: FC<SVGProps<SVGSVGElement>>;
  export const Battery: FC<SVGProps<SVGSVGElement>>;
  export const Wifi: FC<SVGProps<SVGSVGElement>>;
  export const WifiOff: FC<SVGProps<SVGSVGElement>>;
  export const Play: FC<SVGProps<SVGSVGElement>>;
  export const Square: FC<SVGProps<SVGSVGElement>>;
  export const Navigation: FC<SVGProps<SVGSVGElement>>;
  export const AlertTriangle: FC<SVGProps<SVGSVGElement>>;
  export const CalendarDays: FC<SVGProps<SVGSVGElement>>;
  export const Calendar: FC<SVGProps<SVGSVGElement>>;
  export const FileText: FC<SVGProps<SVGSVGElement>>;
  export const Download: FC<SVGProps<SVGSVGElement>>;
  export const FileSpreadsheet: FC<SVGProps<SVGSVGElement>>;
  export const FileDown: FC<SVGProps<SVGSVGElement>>;
  export const Shield: FC<SVGProps<SVGSVGElement>>;
  export const Mail: FC<SVGProps<SVGSVGElement>>;
  export const Check: FC<SVGProps<SVGSVGElement>>;
  export const X: FC<SVGProps<SVGSVGElement>>;
  export const ChevronDown: FC<SVGProps<SVGSVGElement>>;
  export const ChevronUp: FC<SVGProps<SVGSVGElement>>;
  export const Circle: FC<SVGProps<SVGSVGElement>>;
  export const LogIn: FC<SVGProps<SVGSVGElement>>;
  export const Eye: FC<SVGProps<SVGSVGElement>>;
  export const EyeOff: FC<SVGProps<SVGSVGElement>>;
  export const Loader2: FC<SVGProps<SVGSVGElement>>;
  export const SeparatorHorizontal: FC<SVGProps<SVGSVGElement>>;
}

declare module 'next' {
  export type NextConfig = Record<string, any>;
  export type Metadata = Record<string, any>;
}

declare module 'next/navigation' {
  export function useRouter(): any;
  export function usePathname(): string;
  export function useSearchParams(): any;
}

declare module 'next/link' {
  import { FC, ReactNode } from 'react';
  interface LinkProps { href: string; children?: ReactNode; className?: string; [key: string]: any; }
  const Link: FC<LinkProps>;
  export default Link;
}

declare module 'next/dynamic' {
  function dynamic(loader: () => Promise<any>, options?: { ssr?: boolean; loading?: any }): any;
  export default dynamic;
}

declare module 'next/font/google' {
  interface FontOptions { subsets?: string[]; weight?: string[]; display?: string; }
  export function Inter(options: FontOptions): { className: string; style: { fontFamily: string } };
}
