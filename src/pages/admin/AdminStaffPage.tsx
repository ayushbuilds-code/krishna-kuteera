import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Calendar, Plus, UserCheck, X } from 'lucide-react';
import { MOCK_OUTLETS } from '@/data/mockSeed';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  addStaffMemberAdmin,
  fetchStaffAndShiftsAdmin,
  upsertShiftAttendanceAdmin,
} from '@/services/phase6Service';
import type {
  AttendanceStatus,
  ShiftType,
  StaffMember,
  StaffRole,
  StaffShift,
} from '@/types/database';

function todayIso(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

export function AdminStaffPage() {
  const { activeOutletId } = useAdminAuth();
  const targetOutletId =
    activeOutletId === 'all' ? MOCK_OUTLETS[0].id : activeOutletId;

  const [shiftDate, setShiftDate] = useState(todayIso);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [shifts, setShifts] = useState<StaffShift[]>([]);
  const [addOpen, setAddOpen] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole>('kitchen_staff');

  const load = useCallback(async () => {
    const res = await fetchStaffAndShiftsAdmin(activeOutletId, shiftDate);
    setStaffList(res.staffList);
    setShifts(res.shifts);
  }, [activeOutletId, shiftDate]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkAttendance = async (
    member: StaffMember,
    shiftType: ShiftType,
    attendanceStatus: AttendanceStatus
  ) => {
    await upsertShiftAttendanceAdmin({
      outletId: member.outlet_id || targetOutletId,
      staffId: member.id,
      shiftDate,
      shiftType,
      attendanceStatus,
    });
    await load();
  };

  const handleAddStaff = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;
    await addStaffMemberAdmin({
      outletId: role === 'owner' ? null : targetOutletId,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      role,
    });
    setFullName('');
    setPhone('');
    setEmail('');
    setAddOpen(false);
    await load();
  };

  const shiftByStaffId = new Map(shifts.map((s) => [s.staff_id, s]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-banana">
            Team Roster &amp; Daily Attendance
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-kumkum">
            Staff &amp; Shift Scheduling
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-xl bg-white border border-sand-border px-3 py-2 text-xs font-bold">
            <Calendar className="w-4 h-4 text-kumkum" />
            <input
              type="date"
              aria-label="Shift date"
              value={shiftDate}
              onChange={(e) => setShiftDate(e.target.value)}
              className="bg-transparent focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-kumkum text-white px-4 py-2.5 text-xs font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Staff
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-sand-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-cream-warm text-xs uppercase text-ink-muted border-b border-sand-border">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Shift</th>
                <th className="py-3 px-4">Attendance ({shiftDate})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-border">
              {staffList.map((member) => {
                const shift = shiftByStaffId.get(member.id);
                const currentShiftType: ShiftType = shift?.shift_type || 'morning';
                const currentAttendance: AttendanceStatus =
                  shift?.attendance_status || 'scheduled';

                return (
                  <tr key={member.id}>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-ink flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-banana shrink-0" />
                        {member.full_name}
                      </p>
                      <p className="text-xs text-ink-muted">{member.phone}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-full bg-cream-warm px-2.5 py-0.5 text-xs font-bold capitalize text-wood">
                        {member.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        aria-label={`Shift for ${member.full_name}`}
                        value={currentShiftType}
                        onChange={(e) =>
                          handleMarkAttendance(
                            member,
                            e.target.value as ShiftType,
                            currentAttendance
                          )
                        }
                        className="rounded-lg border border-sand-border bg-cream px-2.5 py-1 text-xs font-semibold"
                      >
                        <option value="morning">Morning (7 AM – 3 PM)</option>
                        <option value="evening">Evening (3 PM – 11 PM)</option>
                        <option value="full_day">Full Day (8 AM – 8 PM)</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {(
                          [
                            { id: 'present', label: 'Present', active: 'bg-banana text-white' },
                            { id: 'half_day', label: 'Half Day', active: 'bg-turmeric text-ink' },
                            { id: 'absent', label: 'Absent', active: 'bg-kumkum text-white' },
                            { id: 'leave', label: 'Leave', active: 'bg-wood text-white' },
                          ] as const
                        ).map((btn) => (
                          <button
                            key={btn.id}
                            type="button"
                            onClick={() =>
                              handleMarkAttendance(member, currentShiftType, btn.id)
                            }
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border cursor-pointer transition-colors ${
                              currentAttendance === btn.id
                                ? `${btn.active} border-transparent`
                                : 'bg-cream border-sand-border text-ink-muted hover:bg-cream-warm'
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {addOpen && (
        <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddStaff}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-sand-border"
          >
            <div className="flex items-center justify-between border-b border-sand-border pb-3">
              <h3 className="font-serif text-xl font-bold text-kumkum">
                Add Staff Member
              </h3>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="p-1 text-ink-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <input
                type="text"
                required
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-sand-border bg-cream px-3 py-2"
              />
              <input
                type="tel"
                required
                placeholder="10-Digit Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-sand-border bg-cream px-3 py-2"
              />
              <input
                type="email"
                placeholder="Email (optional, for login)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-sand-border bg-cream px-3 py-2"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
                className="w-full rounded-xl border border-sand-border bg-cream px-3 py-2 font-semibold"
              >
                <option value="outlet_manager">Outlet Manager</option>
                <option value="kitchen_staff">Kitchen Staff</option>
                <option value="cashier">Cashier</option>
                <option value="owner">Owner</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="rounded-xl border border-sand-border px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-kumkum text-white px-5 py-2 text-xs font-bold cursor-pointer"
              >
                Add Member
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

