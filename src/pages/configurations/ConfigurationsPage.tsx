import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Monitor, Edit, ToggleRight, ToggleLeft } from "lucide-react";
import type { ScaleConfig } from "@/types";
import { Badge } from "@/components/ui/badge";

const ConfigurationsPage = () => {
  // Mock data for now
  const configurations: ScaleConfig[] = [
    {
      id: "waga-magazynowa-1",
      name: "Waga Magazynowa 1",
      connectionType: "tcp",
      address: "192.168.1.100:3001",
      protocol: "rinstrum_c320",
      isEnabled: true,
    },
    {
      id: "waga-lab-2",
      name: "Waga Laboratoryjna",
      connectionType: "serial",
      address: "COM3",
      protocol: "generic_ascii",
      isEnabled: false,
    },
  ];

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Konfiguracje Wag</h1>
            <p className="text-gray-600">
              Zarządzaj połączeniami z wagami pomiarowymi.
            </p>
          </div>
          <Button asChild>
            <Link to="/configurations/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Dodaj nową konfigurację
            </Link>
          </Button>
        </header>

        <main>
          <Card>
            <CardHeader>
              <CardTitle>Lista Konfiguracji</CardTitle>
              <CardDescription>
                Lista wszystkich zdefiniowanych połączeń z wagami.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {configurations.length === 0 ? (
                <div className="p-8 text-center text-gray-500 border-2 border-dashed rounded-lg">
                  <p>Brak zdefiniowanych konfiguracji.</p>
                  <p className="mt-2">
                    <Button variant="link" asChild>
                      <Link to="/configurations/new">Dodaj swoją pierwszą konfigurację</Link>
                    </Button>
                    , aby rozpocząć.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {configurations.map((config) => (
                    <div key={config.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                      <div className="flex items-center gap-4">
                        {config.isEnabled ? <ToggleRight className="h-6 w-6 text-green-500" /> : <ToggleLeft className="h-6 w-6 text-gray-400" />}
                        <div>
                          <h3 className="font-semibold">{config.name}</h3>
                          <p className="text-sm text-gray-500">
                            {config.address}
                            <Badge variant="outline" className="ml-2">{config.protocol}</Badge>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/monitor/${config.id}`}>
                            <Monitor className="mr-2 h-4 w-4" />
                            Monitoruj
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default ConfigurationsPage;