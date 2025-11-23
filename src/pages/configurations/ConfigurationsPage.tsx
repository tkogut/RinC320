import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Monitor, Edit, Trash2, Search } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ScaleForm from "./ScaleForm";
import { useAppContext } from "@/context/AppContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";

const ConfigurationsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { configurations, hosts } = useAppContext();

  const getHostName = (hostId: string) => {
    const host = hosts.find(h => h.id === hostId);
    return host ? `${host.name} (${host.ipAddress}:${host.port})` : "Nieznany host";
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-dark">Konfiguracje Wag</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Szukaj..."
              className="w-full rounded-lg bg-white pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Dodaj konfigurację
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
        </div>
      </header>

      <main>
        <Card>
          <CardContent className="p-0">
            {configurations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>Brak zdefiniowanych konfiguracji. Kliknij "Dodaj konfigurację", aby rozpocząć.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nazwa Wagi</TableHead>
                    <TableHead>Host (Konwerter)</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Typ Połączenia</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configurations.map((config) => (
                    <TableRow key={config.id} className="hover:bg-gray-100 even:bg-gray-50/50">
                      <TableCell className="font-medium">{config.name}</TableCell>
                      <TableCell>{getHostName(config.hostId)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{config.model || "Brak"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{config.connectionType?.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge isActive={config.isEnabled} />
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" className="text-accent-cyan hover:bg-accent-cyan/10 hover:text-accent-cyan" asChild>
                          <Link to={`/monitor/${config.id}`}>
                            <Monitor className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-success-green hover:bg-success-green/10 hover:text-success-green">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-danger-red hover:bg-danger-red/10 hover:text-danger-red">
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