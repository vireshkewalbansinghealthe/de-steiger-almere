'use client';

import React, { createContext, useContext, useState } from 'react';
import FloatingCallButton from './FloatingCallButton';

interface LayoutContextType {
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType>({
  isDrawerOpen: false,
  setIsDrawerOpen: () => {},
});

export const useLayoutContext = () => useContext(LayoutContext);

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <LayoutContext.Provider value={{ isDrawerOpen, setIsDrawerOpen }}>
      {children}
      <FloatingCallButton hidden={isDrawerOpen} />
    </LayoutContext.Provider>
  );
}
