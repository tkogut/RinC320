import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { Host, ScaleConfig, IoDevice, Printer, WeighingRecord, IoGroup } from '@/types';

interface AppContextType {
  hosts: Host[];
  addHost: (host: Omit<Host, 'id'>) => void;
  updateHost: (id: string, updatedHost: Omit<Host, 'id'>) => void;
  deleteHost: (id: string) => void;
  configurations: ScaleConfig[];
  addConfiguration: (config: Omit<ScaleConfig, 'id'>) => void;
  updateConfiguration: (id: string, updatedConfig: Omit<ScaleConfig, 'id'>) => void;
  deleteConfiguration: (id: string) => void;
  devices: IoDevice[];
  addDevice: (device: Omit<IoDevice, 'id'>) => void;
  updateDevice: (id: string, updatedDevice: Omit<IoDevice, 'id'>) => void;
  deleteDevice: (id: string) => void;
  printers: Printer[];
  addPrinter: (printer: Omit<Printer, 'id'>) => void;
  updatePrinter: (id: string, updatedPrinter: Omit<Printer, 'id'>) => void;
  deletePrinter: (id: string) => void;
  groups: IoGroup[];
  addGroup: (group: Omit<IoGroup, 'id'>) => void;
  updateGroup: (id: string, updatedGroup: Omit<IoGroup, 'id'>) => void;
  deleteGroup: (id: string) => void;
  weighings: WeighingRecord[];
  addWeighing: (weighing: Omit<WeighingRecord, 'id' | 'timestamp'>) => void;
  deleteWeighing: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [configurations, setConfigurations] = useState<ScaleConfig[]>([]);
  const [devices, setDevices] = useState<IoDevice[]>([]);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [groups, setGroups] = useState<IoGroup[]>([]);
  const [weighings, setWeighings] = useState<WeighingRecord[]>([]);

  const addHost = (hostData: Omit<Host, 'id'>) => {
    const newHost: Host = { id: crypto.randomUUID(), ...hostData };
    setHosts(prev => [...prev, newHost]);
  };

  const updateHost = (id: string, updatedHostData: Omit<Host, 'id'>) => {
    setHosts(prev => prev.map(host => host.id === id ? { id, ...updatedHostData } : host));
  };

  const deleteHost = (id: string) => {
    setHosts(prev => prev.filter(host => host.id !== id));
  };

  const addConfiguration = (configData: Omit<ScaleConfig, 'id'>) => {
    const newConfig: ScaleConfig = { id: crypto.randomUUID(), ...configData };
    setConfigurations(prev => [...prev, newConfig]);
  };

  const updateConfiguration = (id: string, updatedConfigData: Omit<ScaleConfig, 'id'>) => {
    setConfigurations(prev => prev.map(config => config.id === id ? { id, ...updatedConfigData } : config));
  };

  const deleteConfiguration = (id: string) => {
    setConfigurations(prev => prev.filter(config => config.id !== id));
  };

  const addDevice = (deviceData: Omit<IoDevice, 'id'>) => {
    const newDevice: IoDevice = { id: crypto.randomUUID(), ...deviceData };
    setDevices(prev => [...prev, newDevice]);
  };

  const updateDevice = (id: string, updatedDeviceData: Omit<IoDevice, 'id'>) => {
    setDevices(prev => prev.map(device => device.id === id ? { id, ...updatedDeviceData } : device));
  };

  const deleteDevice = (id: string) => {
    setDevices(prev => prev.filter(device => device.id !== id));
  };

  const addPrinter = (printerData: Omit<Printer, 'id'>) => {
    const newPrinter: Printer = { id: crypto.randomUUID(), ...printerData };
    setPrinters(prev => [...prev, newPrinter]);
  };

  const updatePrinter = (id: string, updatedPrinterData: Omit<Printer, 'id'>) => {
    setPrinters(prev => prev.map(printer => printer.id === id ? { id, ...updatedPrinterData } : printer));
  };

  const deletePrinter = (id: string) => {
    setPrinters(prev => prev.filter(printer => printer.id !== id));
  };

  const addGroup = (groupData: Omit<IoGroup, 'id'>) => {
    const newGroup: IoGroup = { id: crypto.randomUUID(), ...groupData };
    setGroups(prev => [...prev, newGroup]);
  };

  const updateGroup = (id: string, updatedGroupData: Omit<IoGroup, 'id'>) => {
    setGroups(prev => prev.map(group => group.id === id ? { id, ...updatedGroupData } : group));
  };

  const deleteGroup = (id: string) => {
    setGroups(prev => prev.filter(group => group.id !== id));
  };

  const addWeighing = (weighingData: Omit<WeighingRecord, 'id' | 'timestamp'>) => {
    const newWeighing: WeighingRecord = { 
      id: crypto.randomUUID(), 
      timestamp: Date.now(),
      ...weighingData 
    };
    setWeighings(prev => [newWeighing, ...prev]);
  };

  const deleteWeighing = (id: string) => {
    setWeighings(prev => prev.filter(weighing => weighing.id !== id));
  };

  return (
    <AppContext.Provider value={{ 
      hosts, addHost, updateHost, deleteHost, 
      configurations, addConfiguration, updateConfiguration, deleteConfiguration, 
      devices, addDevice, updateDevice, deleteDevice,
      printers, addPrinter, updatePrinter, deletePrinter,
      groups, addGroup, updateGroup, deleteGroup,
      weighings, addWeighing, deleteWeighing
    }}>
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