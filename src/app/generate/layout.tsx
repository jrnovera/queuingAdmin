'use client';

import React from 'react';
import { QueueProvider } from '../context/QueueContext';

export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueueProvider>
      {children}
    </QueueProvider>
  );
}
