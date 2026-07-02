import { create } from 'zustand';
import { Attendance, Employee, Notification } from '@/types';

interface AppState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  checkedInEmployees: any[];
  setCheckedInEmployees: (employees: any[] | ((prev: any[]) => any[])) => void;
  updateEmployeeLocation: (employeeId: string, data: any) => void;

  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[], unreadCount: number) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  setUnreadCount: (count: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  checkedInEmployees: [],
  setCheckedInEmployees: (employees) => set((state) => ({
    checkedInEmployees: typeof employees === 'function' ? employees(state.checkedInEmployees) : employees,
  })),
  updateEmployeeLocation: (employeeId, data) =>
    set((state) => ({
      checkedInEmployees: state.checkedInEmployees.map((emp) =>
        emp.employeeId === employeeId
          ? { ...emp, lastLocation: { ...emp.lastLocation, ...data } }
          : emp
      ),
    })),

  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications, unreadCount) => set({ notifications, unreadCount }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  setUnreadCount: (count) => set({ unreadCount: count }),
}));
