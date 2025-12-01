"use client";

import React from 'react';
import AdminTabLayout from '@/components/admin/AdminTabLayout';
import { TabsContent } from '@/components/ui/controlled-tabs';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminAppointmentsPage() {
  const tabs = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'today', label: "Today's" },
    { key: 'history', label: 'History' },
  ];

  return (
    <AdminTabLayout tabs={tabs} defaultTab="upcoming">
      <TabsContent value="upcoming">
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Upcoming Appointments</h3>
            <div className="text-sm text-muted-foreground">Appointments scheduled in the next 7 days.</div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="today">
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Today's Appointments</h3>
            <div className="text-sm text-muted-foreground">Appointments happening today.</div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history">
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Appointment History</h3>
            <div className="text-sm text-muted-foreground">Past appointments and reports.</div>
          </CardContent>
        </Card>
      </TabsContent>
    </AdminTabLayout>
  );
}
