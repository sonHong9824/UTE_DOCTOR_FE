"use client";

import React from 'react';
import AdminTabLayout from '@/components/admin/AdminTabLayout';
import { TabsContent } from '@/components/ui/controlled-tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminUsersPage() {
  const tabs = [
    { key: 'all', label: 'All Users' },
    { key: 'patients', label: 'Patients' },
    { key: 'doctors', label: 'Doctors' },
  ];

  return (
    <AdminTabLayout tabs={tabs} defaultTab="all">
      <TabsContent value="all">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">All users</h3>
              <Button variant="outline" size="sm">Invite user</Button>
            </div>

            <div className="text-sm text-muted-foreground">Sample table placeholder for all users.</div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="patients">
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Patients</h3>
            <div className="text-sm text-muted-foreground">Patient list and filters go here.</div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="doctors">
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Doctors</h3>
            <div className="text-sm text-muted-foreground">Doctor onboarding and status table.</div>
          </CardContent>
        </Card>
      </TabsContent>
    </AdminTabLayout>
  );
}
