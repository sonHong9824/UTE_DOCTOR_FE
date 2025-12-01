"use client";

import React from 'react';
import AdminTabLayout from '@/components/admin/AdminTabLayout';
import { TabsContent } from '@/components/ui/controlled-tabs';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminDoctorsPage() {
  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'pending', label: 'Pending Approval' },
    { key: 'verified', label: 'Verified' },
  ];

  return (
    <AdminTabLayout tabs={tabs} defaultTab="overview">
      <TabsContent value="overview">
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Doctors Overview</h3>
            <div className="text-sm text-muted-foreground">Summary stats and recent joins.</div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pending">
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Pending Approval</h3>
            <div className="text-sm text-muted-foreground">Approve or reject new doctor accounts.</div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="verified">
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Verified Doctors</h3>
            <div className="text-sm text-muted-foreground">List of verified doctors.</div>
          </CardContent>
        </Card>
      </TabsContent>
    </AdminTabLayout>
  );
}
