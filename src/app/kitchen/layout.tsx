'use client';

import { useState, useEffect } from 'react';

export default function KitchenRootLayout({ children }: { children: React.ReactNode }) {
  if (typeof window === 'undefined') {
    return null;
  }

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return <>{children}</>;
}

