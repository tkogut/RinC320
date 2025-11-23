import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import IoDeviceForm from "./IoDeviceForm";
import type { IoDevice } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const DevicesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [devices, setDevices] = useState<IoDevice[]>([]);

  const handleAddDevice = (deviceData: Omit<IoDevice, "id">) => {
    const newDevice: IoDevice = {
      id: crypto.randomUUID(),
      ...deviceData,
    };
    setDevices(prevDevices => [...prevDevices, newDevice]);
  };

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Urządzenia I/O</h1>
          <p className="text-gray-600">
            Zarządzaj urządzeniami wejścia/wyjścia.
          </p>
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
            <IoDeviceForm setModalOpen={setIsModalOpen} onAddDevice={handleAddDevice} />
          </DialogContent>
        </Dialog>
      </header>

      <main>
        <Card>
          <CardHeader>
            <CardTitle>Lista Urządzeń</CardTitle>
            <CardDescription>
              Lista wszystkich zdefiniowanych urządzeń I/O.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {devices.length === 0 ? (
              <div className="p-8 text-center text-gray-500 border-2 border-dashed rounded-lg">
                <p>Brak zdefiniowanych urządzeń.</p>
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
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">{device.name}</TableCell>
                      <TableCell>{device.host}</TableCell>
                      <TableCell>{device.ipAddress}</TableCell>
                      <TableCell className="text-right">
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

export default DevicesPage;