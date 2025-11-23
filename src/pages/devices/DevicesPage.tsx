import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import IoDeviceForm from "./IoDeviceForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppContext } from "@/context/AppContext";
import { Input } from "@/components/ui/input";
import type { IoDevice } from "@/types";
import { showSuccess } from "@/utils/toast";

const DevicesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deviceToEdit, setDeviceToEdit] = useState<IoDevice | null>(null);
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);
  const { devices, addDevice, updateDevice, deleteDevice, hosts } = useAppContext();

  const getHostName = (hostId: string) => {
    const host = hosts.find(h => h.id === hostId);
    return host ? host.name : "Nieznany host";
  };

  const handleAddClick = () => {
    setDeviceToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (device: IoDevice) => {
    setDeviceToEdit(device);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (deviceToDelete) {
      deleteDevice(deviceToDelete);
      showSuccess("Urządzenie I/O zostało usunięte.");
      setDeviceToDelete(null);
    }
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
              <Button onClick={handleAddClick}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Dodaj urządzenie
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{deviceToEdit ? "Edytuj urządzenie" : "Szczegóły urządzenia"}</DialogTitle>
                <DialogDescription>
                  {deviceToEdit ? "Zmień dane urządzenia I/O." : "Wprowadź dane nowego urządzenia I/O."}
                </DialogDescription>
              </DialogHeader>
              <IoDeviceForm
                setModalOpen={setIsModalOpen}
                onAddDevice={addDevice}
                onUpdateDevice={updateDevice}
                editingDevice={deviceToEdit}
              />
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
                    <TableHead>Opis</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Adres IP</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id} className="hover:bg-gray-100 even:bg-gray-50/50">
                      <TableCell className="font-medium">{device.name}</TableCell>
                      <TableCell>{device.description || "-"}</TableCell>
                      <TableCell>{getHostName(device.hostId)}</TableCell>
                      <TableCell>{device.model || "-"}</TableCell>
                      <TableCell>{device.ipAddress}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" className="text-success-green hover:bg-success-green/10 hover:text-success-green" onClick={() => handleEditClick(device)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-danger-red hover:bg-danger-red/10 hover:text-danger-red" onClick={() => setDeviceToDelete(device.id)}>
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

      <AlertDialog open={!!deviceToDelete} onOpenChange={(open) => !open && setDeviceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć?</AlertDialogTitle>
            <AlertDialogDescription>
              Tej operacji nie można cofnąć. Spowoduje to trwałe usunięcie urządzenia I/O.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeviceToDelete(null)}>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Usuń</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DevicesPage;