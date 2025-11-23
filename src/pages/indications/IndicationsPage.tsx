import React from "react";
import { useAppContext } from "@/context/AppContext";
import ScaleCard from "@/components/ScaleCard";
import { Scale } from "lucide-react";

const IndicationsPage = () => {
  const { configurations, hosts } = useAppContext();
  const activeScales = configurations.filter(c => c.isEnabled);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Wskazania wag</h1>
        <p className="text-gray-500">Podgląd na żywo wszystkich aktywnych wag w systemie.</p>
      </header>

      <main>
        {activeScales.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeScales.map(config => {
              const host = hosts.find(h => h.id === config.hostId);
              return <ScaleCard key={config.id} config={config} host={host} />;
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-gray-500 border-2 border-dashed rounded-lg p-12">
            <Scale className="h-12 w-12 mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold">Brak aktywnych wag</h2>
            <p className="mt-2 max-w-md">
              Nie znaleziono żadnych włączonych konfiguracji wag. Aby zobaczyć wskazania,
              przejdź do sekcji <a href="#/scales" className="text-primary-blue underline">Konfiguracja Wag</a> i dodaj nową wagę lub włącz istniejącą.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default IndicationsPage;