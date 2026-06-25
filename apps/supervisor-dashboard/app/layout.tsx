import React from "react"
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart Waste Management - Supervisor Dashboard',
  description: 'Manage waste collection, collectors, and billing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
