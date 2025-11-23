export type ConnectionType = "tcp" | "serial";

// This will expand as we support more scales
export type Protocol = "rinstrum_c320" | "generic_ascii";

export interface ScaleConfig {
  id: string; // e.g., UUID
  name: string;
  connectionType: ConnectionType;
  // For TCP: "192.168.1.100:3000"
  // For Serial: "COM1"
  address: string;
  // For Serial port specific settings
  baudRate?: number;
  dataBits?: 5 | 6 | 7 | 8;
  stopBits?: 1 | 2;
  parity?: "none" | "odd" | "even";

  protocol: Protocol;
  isEnabled: boolean;
}

export interface Host {
  id: string;
  name: string;
  description?: string;
  ipAddress: string;
  port: number;
  isActive: boolean;
}

export interface IoDevice {
  id: string;
  name: string;
  description?: string;
  host: string;
  ipAddress: string;
}

// Types for monitoring data
export type Reading = { ts: number; weight: number | null };

export type LogEntry = {
  ts: number;
  level?: "info" | "warn" | "error";
  message: string;
};

export type CmdEntry = {
  ts: number;
  cmd: string;
  status: "sent" | "ok" | "error";
  resp?: string;
};