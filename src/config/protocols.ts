import type { Protocol } from '@/types';

export type ProtocolCommands = {
  read: string;
  tare: string;
  zero: string;
};

export const protocolCommands: Record<Protocol, ProtocolCommands> = {
  rinstrum_c320: {
    read: "20050026:", // Read Gross
    tare: "tare",       // Backend bridge likely translates this
    zero: "21120008:0B",
  },
  generic_ascii: {
    read: "READ",
    tare: "TARE",
    zero: "ZERO",
  },
};