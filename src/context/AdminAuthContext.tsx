import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { MOCK_OUTLETS } from '@/data/mockSeed';
import type { StaffMember, StaffRole } from '@/types/database';

const DEMO_STAFF_STORAGE_KEY = 'kk_demo_staff_session_v1';

export type AdminPermission =
  | 'view_dashboard'
  | 'manage_outlets'
  | 'manage_menu'
  | 'toggle_availability'
  | 'manage_orders'
  | 'manage_tables'
  | 'manage_inventory'
  | 'manage_staff'
  | 'view_crm'
  | 'view_reports'
  | 'manage_content';

const ROLE_PERMISSIONS: Record<StaffRole, AdminPermission[]> = {
  owner: [
    'view_dashboard',
    'manage_outlets',
    'manage_menu',
    'toggle_availability',
    'manage_orders',
    'manage_tables',
    'manage_inventory',
    'manage_staff',
    'view_crm',
    'view_reports',
    'manage_content',
  ],
  outlet_manager: [
    'view_dashboard',
    'manage_outlets',
    'manage_menu',
    'toggle_availability',
    'manage_orders',
    'manage_tables',
    'manage_inventory',
    'manage_staff',
    'view_crm',
    'view_reports',
    'manage_content',
  ],
  kitchen_staff: ['toggle_availability', 'manage_orders', 'manage_inventory'],
  cashier: ['view_dashboard', 'manage_orders', 'manage_tables', 'view_crm'],
};

// eslint-disable-next-line react-refresh/only-export-components
export const DEMO_STAFF_PROFILES: StaffMember[] = [
  {
    id: 'staff-owner-1',
    auth_user_id: null,
    outlet_id: null,
    full_name: 'Suresh Kamath (Owner)',
    phone: '9845011111',
    email: 'owner@krishnakuteera.in',
    role: 'owner',
    is_active: true,
    joined_at: '2018-04-01',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'staff-mgr-hulimavu',
    auth_user_id: null,
    outlet_id: MOCK_OUTLETS[0].id,
    full_name: 'Prakash Shetty (Hulimavu Manager)',
    phone: '9845022222',
    email: 'hulimavu.mgr@krishnakuteera.in',
    role: 'outlet_manager',
    is_active: true,
    joined_at: '2020-06-15',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'staff-kit-hulimavu',
    auth_user_id: null,
    outlet_id: MOCK_OUTLETS[0].id,
    full_name: 'Manjunath Bhat (Head Cook — Hulimavu)',
    phone: '9845033333',
    email: 'kitchen.hulimavu@krishnakuteera.in',
    role: 'kitchen_staff',
    is_active: true,
    joined_at: '2021-01-10',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'staff-csh-jpnagar',
    auth_user_id: null,
    outlet_id: MOCK_OUTLETS[1].id,
    full_name: 'Deepa Kulkarni (Cashier — JP Nagar)',
    phone: '9845044444',
    email: 'cashier.jpnagar@krishnakuteera.in',
    role: 'cashier',
    is_active: true,
    joined_at: '2022-03-01',
    created_at: '2026-01-01T00:00:00Z',
  },
];

interface AdminAuthContextValue {
  staff: StaffMember | null;
  loading: boolean;
  isOwner: boolean;
  /** Outlet ID the staff member is scoped to; owners can switch freely */
  activeOutletId: string;
  setActiveOutletId: (id: string) => void;
  can: (permission: AdminPermission) => boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInDemoRole: (profile: StaffMember) => void;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeOutletId, setActiveOutletIdState] = useState<string>(
    MOCK_OUTLETS[0].id
  );

  useEffect(() => {
    let active = true;
    (async () => {
      if (!isSupabaseConfigured) {
        try {
          const raw = localStorage.getItem(DEMO_STAFF_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as StaffMember;
            if (active) {
              setStaff(parsed);
              setActiveOutletIdState(parsed.outlet_id || MOCK_OUTLETS[0].id);
            }
          }
        } catch {
          // ignore
        }
        if (active) setLoading(false);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (userId) {
        const { data: staffRow } = await supabase
          .from('staff')
          .select('*')
          .eq('auth_user_id', userId)
          .eq('is_active', true)
          .maybeSingle();

        if (staffRow && active) {
          const member = staffRow as StaffMember;
          setStaff(member);
          setActiveOutletIdState(member.outlet_id || MOCK_OUTLETS[0].id);
        }
      }
      if (active) setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  const setActiveOutletId = useCallback(
    (id: string) => {
      // Non-owners are strictly locked to their assigned outlet
      if (staff && staff.role !== 'owner' && staff.outlet_id) {
        setActiveOutletIdState(staff.outlet_id);
        return;
      }
      setActiveOutletIdState(id);
    },
    [staff]
  );

  const can = useCallback(
    (permission: AdminPermission) => {
      if (!staff) return false;
      return ROLE_PERMISSIONS[staff.role]?.includes(permission) ?? false;
    },
    [staff]
  );

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase is not configured yet. Use one of the Demo Staff Roles below to test.'
      );
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user) {
      throw new Error(error?.message || 'Invalid login credentials.');
    }
    const { data: staffRow, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('auth_user_id', data.user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (staffError || !staffRow) {
      await supabase.auth.signOut();
      throw new Error(
        'Signed in, but no active Krishna Kuteera staff record is linked to this account.'
      );
    }
    const member = staffRow as StaffMember;
    setStaff(member);
    setActiveOutletIdState(member.outlet_id || MOCK_OUTLETS[0].id);
  }, []);

  const signInDemoRole = useCallback((profile: StaffMember) => {
    setStaff(profile);
    setActiveOutletIdState(profile.outlet_id || MOCK_OUTLETS[0].id);
    try {
      localStorage.setItem(DEMO_STAFF_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    try {
      localStorage.removeItem(DEMO_STAFF_STORAGE_KEY);
    } catch {
      // ignore
    }
    setStaff(null);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        staff,
        loading,
        isOwner: staff?.role === 'owner',
        activeOutletId,
        setActiveOutletId,
        can,
        signInWithEmail,
        signInDemoRole,
        signOut,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  }
  return ctx;
}

