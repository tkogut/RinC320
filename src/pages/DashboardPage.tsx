import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Scale, Server, Printer, Network, Monitor } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { MadeWithDyad } from "@/components/made-with-dyad";
import StatusBadge from "@/components/ui/StatusBadge";

const DashboardPage = () => {
  const { configurations, hosts, printers, devices } = useAppContext();
  const navigate = useNavigate();

  const activeScales = configurations.filter(c => c.isEnabled);

  const getHostName = (hostId: string) => {
    return hosts.find(h => h.id === hostId)?.name || "N/A";
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Witaj w panelu zarządzania ScaleIT.</p>
      </header>

      <main className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skonfigurowane Wagi</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{configurations.length}</div>
              <p className="text-xs text-muted-foreground">{activeScales.length} włączonych</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hosty</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hosts.length}</div>
              <p className="text-xs text-muted-foreground">{hosts.filter(h => h.isActive).length} aktywnych</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drukarki</CardTitle>
              <Printer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{printers.length}</div>
              <p className="text-xs text-muted-foreground">&nbsp;</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urządzenia I/O</CardTitle>
              <Network className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{devices.length}</div>
              <p className="text-xs text-muted-foreground">&nbsp;</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Aktywne Wagi</CardTitle>
          </CardHeader>
          <CardContent>
            {activeScales.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nazwa Wagi</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeScales.map(scale => (
                    <TableRow key={scale.id}>
                      <TableCell className="font-medium">{scale.name}</TableCell>
                      <TableCell>{getHostName(scale.hostId)}</TableCell>
                      <TableCell>
                        <StatusBadge isActive={scale.isEnabled} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/scales/monitor/${scale.id}`)}>
                          <Monitor className="mr-2 h-4 w-4" />
                          Monitoruj
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>Brak aktywnych wag do wyświetlenia.</p>
                <p className="text-sm mt-2">Możesz dodać nową wagę lub włączyć istniejącą w sekcji "Wagi".</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="mt-8">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default DashboardPage;