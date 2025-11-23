import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import IoGroupControls from "@/components/pins/IoGroupControls";
import { ToggleRight } from "lucide-react";

const PinsPage = () => {
  const { groups, devices } = useAppContext();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const selectedDevice = devices.find(d => d.id === selectedGroup?.deviceId);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Sterowanie I/O</h1>
        <p className="text-gray-500">Bezpośrednia kontrola i symulacja stanu wejść/wyjść.</p>
      </header>

      <main>
        {groups.length > 0 ? (
          <div className="space-y-6">
            <div className="max-w-sm">
              <label className="text-sm font-medium mb-2 block">Wybierz grupę I/O</label>
              <Select onValueChange={setSelectedGroupId} value={selectedGroupId || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz grupę do sterowania..." />
                </SelectTrigger>
                <SelectContent>
                  {groups.map(group => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedGroup && (
              <IoGroupControls group={selectedGroup} device={selectedDevice} />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-gray-500 border-2 border-dashed rounded-lg p-12">
            <ToggleRight className="h-12 w-12 mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold">Brak zdefiniowanych grup I/O</h2>
            <p className="mt-2 max-w-md">
              Aby rozpocząć sterowanie, najpierw skonfiguruj urządzenia oraz grupy I/O w sekcji 
              <a href="#/groups" className="text-primary-blue underline"> Konfiguracja</a>.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PinsPage;