import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Monitor, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ScaleForm from "./ScaleForm";
import { useAppContext } from "@/context/AppContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ConfigurationsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { configurations, hosts } = useAppContext();

  const getHostName = (hostId: string) => {
    const host = hosts.find(h => h.id === hostId);
    return host ? `${host.name} (${host.ipAddress}:${host.port})` : "Nieznany host";
  };

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Konfiguracje Wag</h1>
          <p className="text-gray-600">
            Zarządzaj połączeniami z wagami pomiarowymi.
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Dodaj nową konfigurację
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Szczegóły wagi</DialogTitle>
              <DialogDescription>
                Wprowadź szczegóły konfiguracji dla nowej wagi.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-grow overflow-hidden">
              <ScaleForm setModalOpen={setIsModalOpen} />
            </div>
          </DialogContent>
        </Dialog>
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
                <p>Brak zdefiniowanych konfiguracji. Najpierw dodaj konfigurację.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nazwa Wagi</TableHead>
                    <TableHead>Host (Konwerter)</TableHead>
                    <TableHead>Protokół</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configurations.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell className="font-medium">{config.name}</TableCell>
                      <TableCell>{getHostName(config.hostId)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{config.protocol}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.isEnabled ? "default" : "outline"}>
                          {config.isEnabled ? "Włączona" : "Wyłączona"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/monitor/${config.id}`}>
                            <Monitor className="mr-2 h-4 w-4" />
                            Monitoruj
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ConfigurationsPage;