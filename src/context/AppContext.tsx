import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { Host, ScaleConfig } from '@/types';

interface AppContextType {
  hosts: Host[];
  addHost: (host: Omit<Host, 'id'>) => void;
  configurations: ScaleConfig[];
  addConfiguration: (config: Omit<ScaleConfig, 'id'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [configurations, setConfigurations] = useState<ScaleConfig[]>([]);

  const addHost = (hostData: Omit<Host, 'id'>) => {
    const newHost: Host = {
      id: crypto.randomUUID(),
      ...hostData,
    };
    setHosts(prev => [...prev, newHost]);
  };

  const addConfiguration = (configData: Omit<ScaleConfig, 'id'>) => {
    const newConfig: ScaleConfig = {
      id: crypto.randomUUID(),
      ...configData,
    };
    setConfigurations(prev => [...prev, newConfig]);
  };

  return (
    <AppContext.Provider value={{ hosts, addHost, configurations, addConfiguration }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};