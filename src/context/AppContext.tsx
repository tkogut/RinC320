import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { Host, ScaleConfig, IoDevice } from '@/types';

interface AppContextType {
  hosts: Host[];
  addHost: (host: Omit<Host, 'id'>) => void;
  configurations: ScaleConfig[];
  addConfiguration: (config: Omit<ScaleConfig, 'id'>) => void;
  updateConfiguration: (id: string, updatedConfig: Omit<ScaleConfig, 'id'>) => void;
  deleteConfiguration: (id: string) => void;
  devices: IoDevice[];
  addDevice: (device: Omit<IoDevice, 'id'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [configurations, setConfigurations] = useState<ScaleConfig[]>([]);
  const [devices, setDevices] = useState<IoDevice[]>([]);

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

  const updateConfiguration = (id: string, updatedConfigData: Omit<ScaleConfig, 'id'>) => {
    setConfigurations(prev =>
      prev.map(config =>
        config.id === id ? { id, ...updatedConfigData } : config
      )
    );
  };

  const deleteConfiguration = (id: string) => {
    setConfigurations(prev => prev.filter(config => config.id !== id));
  };

  const addDevice = (deviceData: Omit<IoDevice, 'id'>) => {
    const newDevice: IoDevice = {
      id: crypto.randomUUID(),
      ...deviceData,
    };
    setDevices(prev => [...prev, newDevice]);
  };

  return (
    <AppContext.Provider value={{ hosts, addHost, configurations, addConfiguration, updateConfiguration, deleteConfiguration, devices, addDevice }}>
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