import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Wifi, WifiOff } from "lucide-react";
import { useScaleIndication } from "@/hooks/useScaleIndication";
import type { ScaleConfig, Host } from "@/types";

type ScaleCardProps = {
  config: ScaleConfig;
  host: Host | undefined;
};

const ScaleCard = ({ config, host }: ScaleCardProps) => {
  const navigate = useNavigate();
  const { weight, unit, status } = useScaleIndication(host || null, config.protocol);

  const statusColor = status === 'ok' ? 'text-green-500' : status === 'loading' ? 'text-yellow-500' : 'text-red-500';
  const StatusIcon = status === 'ok' ? Wifi : WifiOff;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{config.name}</CardTitle>
          <StatusIcon className={`h-5 w-5 ${statusColor}`} />
        </div>
        <CardDescription>{host?.name || "Brak hosta"} ({host?.ipAddress})</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        <div className="text-center">
          {status === 'loading' ? (
            <p className="text-2xl text-gray-500">Ładowanie...</p>
          ) : (
            <>
              <p className="text-6xl font-bold font-mono tracking-tighter">
                {weight !== null ? weight.toFixed(2) : "-.--"}
              </p>
              <p className="text-xl text-gray-600">{unit}</p>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={() => navigate(`/scales/monitor/${config.id}`)}>
          <Monitor className="mr-2 h-4 w-4" />
          Pełny monitoring
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ScaleCard;