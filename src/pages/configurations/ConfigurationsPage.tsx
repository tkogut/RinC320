import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, Search, ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ScaleForm from "./ScaleForm";
import { useAppContext } from "@/context/AppContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import type { ConnectionType } from "@/types";

const ConfigurationsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { configurations, hosts } = useAppContext();

  const displayConnectionType = (type?: ConnectionType) => {
    if (type === 'tcp') return 'ETHERNET';
    if (type === 'serial') return 'SERIAL';
    return '-';
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-dark">Wagi</h1>
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
                + Dodaj
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
                <p>Brak zdefiniowanych konfiguracji. Kliknij "+ Dodaj", aby rozpocząć.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><Button variant="ghost" className="px-1">Nazwa<ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                    <TableHead><Button variant="ghost" className="px-1">Host<ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                    <TableHead><Button variant="ghost" className="px-1">Oddział<ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                    <TableHead><Button variant="ghost" className="px-1">Opis<ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                    <TableHead><Button variant="ghost" className="px-1">Model<ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                    <TableHead><Button variant="ghost" className="px-1">Typ połączenia<ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                    <TableHead><Button variant="ghost" className="px-1">Adres IP<ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                    <TableHead><Button variant="ghost" className="px-1">Port<ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configurations.map((config) => {
                    const host = hosts.find(h => h.id === config.hostId);
                    return (
                      <TableRow key={config.id} className="hover:bg-gray-100 even:bg-gray-50/50">
                        <TableCell className="font-medium">{config.name}</TableCell>
                        <TableCell>{host ? host.name : "-"}</TableCell>
                        <TableCell>{config.department || "Domyślny oddział"}</TableCell>
                        <TableCell>{config.description || "-"}</TableCell>
                        <TableCell>{config.model || "-"}</TableCell>
                        <TableCell>{displayConnectionType(config.connectionType)}</TableCell>
                        <TableCell>{host ? host.ipAddress : "-"}</TableCell>
                        <TableCell>{host ? host.port : "-"}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="icon" className="h-8 w-8 bg-success-green hover:bg-success-green/90">
                            <Edit className="h-4 w-4 text-white" />
                          </Button>
                          <Button size="icon" className="h-8 w-8 bg-green-400 hover:bg-green-400/90">
                            <Trash2 className="h-4 w-4 text-white" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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