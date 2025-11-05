'use client';

import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen p-6 bg-gray-50 text-gray-900">
      {children}
    </main>
  );
}
