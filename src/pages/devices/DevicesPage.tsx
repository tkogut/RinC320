import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import IoDeviceForm from "./IoDeviceForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppContext } from "@/context/AppContext";
import { Input } from "@/components/ui/input";

const DevicesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { devices, addDevice, hosts } = useAppContext();

  const getHostName = (hostId: string) => {
    const host = hosts.find(h => h.id === hostId);
    return host ? host.name : "Nieznany host";
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-dark">Urządzenia I/O</h1>
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
                Dodaj urządzenie
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Szczegóły urządzenia</DialogTitle>
                <DialogDescription>
                  Wprowadź dane nowego urządzenia I/O.
                </DialogDescription>
              </DialogHeader>
              <IoDeviceForm setModalOpen={setIsModalOpen} onAddDevice={addDevice} />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main>
        <Card>
          <CardContent className="p-0">
            {devices.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>Brak zdefiniowanych urządzeń. Kliknij "Dodaj urządzenie", aby rozpocząć.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nazwa</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>Adres IP</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id} className="hover:bg-gray-100 even:bg-gray-50/50">
                      <TableCell className="font-medium">{device.name}</TableCell>
                      <TableCell>{getHostName(device.hostId)}</TableCell>
                      <TableCell>{device.ipAddress}</TableCell>
                      <TableCell className="text-right space-x-1">
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

export default DevicesPage;