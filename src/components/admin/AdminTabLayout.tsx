"use client";

import React, { ReactNode } from 'react';
import { ControlledTabs, TabsList, TabsTrigger } from '@/components/ui/controlled-tabs';
import { cn } from '@/lib/utils';

interface TabItem {
  key: string;
  label: string;
}

interface AdminTabLayoutProps {
  tabs: TabItem[];
  defaultTab?: string;
  className?: string;
  children: ReactNode;
}

export default function AdminTabLayout({ tabs, defaultTab, className, children }: AdminTabLayoutProps) {
  return (
    <div className={cn('w-full', className)}>
      <ControlledTabs defaultValue={defaultTab ?? tabs[0]?.key}>
        <div className="mb-4">
          <TabsList>
            {tabs.map((t) => (
              <TabsTrigger key={t.key} value={t.key}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="bg-card rounded-md">{children}</div>
      </ControlledTabs>
    </div>
  );
}
