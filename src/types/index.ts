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