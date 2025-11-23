"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { IoGroup, IoDevice } from "@/types";
import { showSuccess } from "@/utils/toast";

type IoGroupControlsProps = {
  group: IoGroup;
  device: IoDevice | undefined;
};

const NUM_PINS = 8;

const IoGroupControls = ({ group, device }: IoGroupControlsProps) => {
  const [pinStates, setPinStates] = useState({
    inputs: Array(NUM_PINS).fill(false),
    outputs: Array(NUM_PINS).fill(false),
  });

  useEffect(() => {
    // Reset states when group changes
    setPinStates({
      inputs: Array(NUM_PINS).fill(false),
      outputs: Array(NUM_PINS).fill(false),
    });
  }, [group]);

  const toggleOutput = (index: number) => {
    setPinStates(prev => {
      const newOutputs = [...prev.outputs];
      newOutputs[index] = !newOutputs[index];
      showSuccess(`Wyjście ${index + 1} zostało ${newOutputs[index] ? 'włączone' : 'wyłączone'}.`);
      return { ...prev, outputs: newOutputs };
    });
  };

  const simulateInputChange = (index: number) => {
    setPinStates(prev => {
      const newInputs = [...prev.inputs];
      newInputs[index] = !newInputs[index];
      showSuccess(`Symulowano zmianę stanu wejścia ${index + 1} na ${newInputs[index] ? 'wysoki' : 'niski'}.`);
      return { ...prev, inputs: newInputs };
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sterowanie grupą: {group.name}</CardTitle>
        <CardDescription>
          Urządzenie: {device?.name || 'Nieznane'} ({device?.ipAddress})
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-4">Wyjścia (Outputs)</h3>
          <div className="space-y-4">
            {pinStates.outputs.map((state, index) => (
              <div key={`out-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <Label htmlFor={`output-${index}`}>Wyjście {index + 1}</Label>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${state ? 'text-green-600' : 'text-gray-500'}`}>
                    {state ? 'WŁ' : 'WYŁ'}
                  </span>
                  <Switch
                    id={`output-${index}`}
                    checked={state}
                    onCheckedChange={() => toggleOutput(index)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Wejścia (Inputs)</h3>
          <div className="space-y-4">
            {pinStates.inputs.map((state, index) => (
              <div key={`in-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <Label>Wejście {index + 1}</Label>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${state ? 'text-green-600' : 'text-gray-500'}`}>
                    {state ? 'Wysoki' : 'Niski'}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => simulateInputChange(index)}>
                    Symuluj
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IoGroupControls;