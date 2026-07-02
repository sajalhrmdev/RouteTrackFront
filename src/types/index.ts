export interface User {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'MANAGER' | 'EMPLOYEE';
  companyId: string;
  company?: { name: string; logo?: string };
}

export interface AuthResponse {
  user: User;
  tokens: JwtTokens;
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  department?: { id: string; name: string };
  designation?: { id: string; name: string };
  reportingManager?: { id: string; name: string };
  isOnline: boolean;
  lastLocationAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  _count?: { employees: number };
  createdAt: string;
}

export interface Designation {
  id: string;
  name: string;
  description?: string;
  _count?: { employees: number };
  createdAt: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  employee: {
    id: string;
    name: string;
    avatar?: string;
    employeeId: string;
    isOnline: boolean;
    department?: { name: string };
    designation?: { name: string };
  };
  checkInTime: string;
  checkOutTime?: string;
  status: 'CHECKED_IN' | 'CHECKED_OUT';
  checkInLat?: number;
  checkInLng?: number;
  checkOutLat?: number;
  checkOutLng?: number;
  totalDistance: number;
  totalWorkingTime: number;
  lastLocation?: GpsLocationData;
  isOnline: boolean;
}

export interface GpsLocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  batteryLevel?: number;
  timestamp: string;
}

export interface GpsLocation extends GpsLocationData {
  id: string;
  employeeId: string;
  attendanceId?: string;
}

export interface RouteHistory {
  locations: GpsLocation[];
  totalDistance: number;
  totalTime: number;
  startTime?: string;
  endTime?: string;
  startLocation?: { lat: number; lng: number };
  endLocation?: { lat: number; lng: number };
}

export interface DashboardStats {
  totalEmployees: number;
  employeesOnline: number;
  employeesOffline: number;
  todayAttendance: number;
  totalDistance: number;
  averageWorkingHours: number;
  activeRoutes: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  data?: any;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export type AttendanceStatus = 'CHECKED_IN' | 'CHECKED_OUT';
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type UserRole = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'MANAGER' | 'EMPLOYEE';
