"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const statusBadge = (status: string) => {
  const s = String(status).toLowerCase();
  if (s.includes('completed')) return <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800">Completed</span>;
  if (s.includes('pending')) return <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">Pending</span>;
  if (s.includes('cancel')) return <span className="px-2 py-0.5 rounded-full text-xs bg-rose-100 text-rose-800">Canceled</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">{status}</span>;
};

const SummaryCard = ({ title, value, delta }: { title: string; value: string | number; delta?: string }) => (
  <Card className="p-4">
    <CardContent>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="text-2xl font-bold mt-1">{value}</div>
        </div>
        {delta && <Badge variant="secondary">{delta}</Badge>}
      </div>
    </CardContent>
  </Card>
);

export default function AdminPage() {
  // Placeholder data — wire up real APIs later
  const stats = {
    users: 1248,
    doctors: 86,
    appointmentsToday: 42,
    revenueMonth: '₫ 128,400,000',
  };

  const recentUsers = [
    { id: 'u1', name: 'Nguyen Van A', email: 'a@example.com', role: 'PATIENT' },
    { id: 'u2', name: 'Tran Thi B', email: 'b@example.com', role: 'DOCTOR' },
    { id: 'u3', name: 'Le Van C', email: 'c@example.com', role: 'PATIENT' },
  ];

  const recentDoctors = [
    { id: 'd1', name: 'BS. Nguyen Hong Son', specialty: 'Cardiology', status: 'active' },
    { id: 'd2', name: 'BS. Tran Van B', specialty: 'Neurology', status: 'active' },
  ];

  const recentAppointments = [
    { id: 'a1', patient: 'Nguyen Van A', doctor: 'BS. Nguyen Hong Son', date: '2025-12-01 09:00', status: 'Completed' },
    { id: 'a2', patient: 'Le Van C', doctor: 'BS. Tran Van B', date: '2025-12-01 10:30', status: 'Pending' },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of system health and activity</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost">Export</Button>
          <Button>Create report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard title="Users" value={stats.users} delta="+3%" />
        <SummaryCard title="Doctors" value={stats.doctors} delta="+1%" />
        <SummaryCard title="Appointments Today" value={stats.appointmentsToday} delta="-2%" />
        <SummaryCard title="Revenue (month)" value={stats.revenueMonth} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Recent users</h2>
                <div className="text-sm text-muted-foreground">Latest signups</div>
              </div>

              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="py-2">Name</th>
                      <th className="py-2">Email</th>
                      <th className="py-2">Role</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((u) => (
                      <tr key={u.id} className="border-t">
                        <td className="py-3">{u.name}</td>
                        <td className="py-3 text-xs text-muted-foreground">{u.email}</td>
                        <td className="py-3"><Badge variant="outline">{u.role}</Badge></td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost">View</Button>
                            <Button size="sm" variant="outline">Suspend</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          {/* Additional sub-tables: Recent Doctors */}
          <div className="mt-6">
            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Recent doctors</h3>
                  <div className="text-sm text-muted-foreground">Newly onboarded</div>
                </div>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs text-muted-foreground">
                      <tr>
                        <th className="py-2">Name</th>
                        <th className="py-2">Specialty</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentDoctors.map((d) => (
                        <tr key={d.id} className="border-t">
                          <td className="py-3 font-medium">{d.name}</td>
                          <td className="py-3 text-xs text-muted-foreground">{d.specialty}</td>
                          <td className="py-3">{d.status === 'active' ? <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Active</span> : <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-800">{d.status}</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <aside>
          <Card className="mb-4">
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">Realtime</h3>
              <div className="text-sm text-muted-foreground mb-3">Active sessions: <span className="font-medium">32</span></div>
              <div className="text-sm text-muted-foreground">Pending verifications: <span className="font-medium">4</span></div>
              <div className="mt-4">
                <Button size="sm">View logs</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Upcoming</h3>
                <div className="text-xs text-muted-foreground">Next 24h</div>
              </div>
              <div className="space-y-2">
                {recentAppointments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div>
                      <div className="font-medium">{a.patient} → <span className="text-muted-foreground">{a.doctor}</span></div>
                      <div className="text-xs text-muted-foreground">{a.date}</div>
                    </div>
                    <div className="shrink-0">{statusBadge(a.status)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
