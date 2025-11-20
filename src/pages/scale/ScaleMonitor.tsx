"use client";

import React from "react";
import { useScaleMonitor } from "./useScaleMonitor";
import ScaleMonitorView from "./ScaleMonitorView";

const ScaleMonitor: React.FC = () => {
  const api = useScaleMonitor();
  return <ScaleMonitorView api={api} />;
};

export default ScaleMonitor;