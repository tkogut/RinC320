export type ConnectionType = "tcp" | "serial";

// This will expand as we support more scales
export type Protocol = "rinstrum_c320" | "generic_ascii";

export interface ScaleConfig {
  id: string;
  name: string;
  description?: string;
  hostId: string; // Link to a Host
  protocol: Protocol;
  isEnabled: boolean;
  model?: string;
  measurementRegex?: string;
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