'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MapPin,
  Users,
  Building2,
  Briefcase,
  Route,
  FileBarChart,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Clock,
  UserCircle,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const adminNavItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/employees', icon: Users, label: 'Employees' },
  { href: '/admin/departments', icon: Building2, label: 'Departments' },
  { href: '/admin/designations', icon: Briefcase, label: 'Designations' },
  { href: '/admin/route-history', icon: Route, label: 'Route History' },
  { href: '/admin/reports', icon: FileBarChart, label: 'Reports' },
];

const employeeNavItems = [
  { href: '/employee', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/employee/history', icon: Clock, label: 'My History' },
  { href: '/employee/route-history', icon: Route, label: 'My Routes' },
  { href: '/employee/profile', icon: UserCircle, label: 'Profile' },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  const isAdmin = user?.role === 'COMPANY_ADMIN' || user?.role === 'MANAGER' || user?.role === 'SUPER_ADMIN';
  const navItems = isAdmin ? adminNavItems : employeeNavItems;

  const getInitials = (name: string) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <motion.aside
        initial={false}
        animate={sidebarOpen ? { x: 0 } : { x: '-100%' }}
        className={cn(
          'fixed left-0 top-0 h-full z-50 w-[260px] flex flex-col border-r border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden md:hidden'
        )}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <span className="font-bold text-gradient">FieldTrack</span>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={toggleSidebar}>
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="border-t border-border/50 p-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.company?.logo} />
              <AvatarFallback>{getInitials(user?.email || 'U')}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {user?.role?.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground mt-2"
            onClick={() => {
              logout();
              window.location.href = '/auth/login';
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </motion.aside>

      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 72 }}
        className={cn(
          'fixed left-0 top-0 h-full z-40 flex-col border-r border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden hidden md:flex'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border/50">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <span className="font-bold text-gradient">FieldTrack</span>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="shrink-0"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <AnimatePresence mode="wait">
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="border-t border-border/50 p-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.company?.logo} />
              <AvatarFallback>{getInitials(user?.email || 'U')}</AvatarFallback>
            </Avatar>
            <AnimatePresence mode="wait">
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {user?.role?.replace('_', ' ')}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {sidebarOpen && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground mt-2"
              onClick={() => {
                logout();
                window.location.href = '/auth/login';
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          )}
        </div>
      </motion.aside>
    </>
  );
}
