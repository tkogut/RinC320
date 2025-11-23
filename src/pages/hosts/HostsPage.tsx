import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import HostForm from "./HostForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppContext } from "@/context/AppContext";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/ui/StatusBadge";
import type { Host } from "@/types";
import { showSuccess } from "@/utils/toast";

const HostsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hostToDelete, setHostToDelete] = useState<string | null>(null);
  const [hostToEdit, setHostToEdit] = useState<Host | null>(null);
  const { hosts, addHost, updateHost, deleteHost } = useAppContext();

  const handleDelete = () => {
    if (hostToDelete) {
      deleteHost(hostToDelete);
      showSuccess("Host został usunięty.");
      setHostToDelete(null);
    }
  };

  const handleAddClick = () => {
    setHostToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (host: Host) => {
    setHostToEdit(host);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-dark">Hosty</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Szukaj..."
              className="w-full rounded-lg bg-white pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          <Button onClick={handleAddClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Dodaj hosta
          </Button>
        </div>
      </header>

      <main>
        <Card>
          <CardContent className="p-0">
            {hosts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>Brak zdefiniowanych hostów. Kliknij "Dodaj hosta", aby rozpocząć.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nazwa</TableHead>
                    <TableHead>Opis</TableHead>
                    <TableHead>Adres IP</TableHead>
                    <TableHead>Port</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hosts.map((host) => (
                    <TableRow key={host.id} className="hover:bg-gray-100 even:bg-gray-50/50">
                      <TableCell className="font-medium">{host.name}</TableCell>
                      <TableCell className="text-gray-600">{host.description || "-"}</TableCell>
                      <TableCell>{host.ipAddress}</TableCell>
                      <TableCell>{host.port}</TableCell>
                      <TableCell>
                        <StatusBadge isActive={host.isActive} />
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" className="text-accent-cyan hover:bg-accent-cyan/10 hover:text-accent-cyan" onClick={() => alert('Funkcjonalność wkrótce!')}>
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-success-green hover:bg-success-green/10 hover:text-success-green" onClick={() => handleEditClick(host)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-danger-red hover:bg-danger-red/10 hover:text-danger-red" onClick={() => setHostToDelete(host.id)}>
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{hostToEdit ? "Edytuj hosta" : "Szczegóły hosta"}</DialogTitle>
            <DialogDescription>
              {hostToEdit ? "Zmień dane hosta." : "Wprowadź dane nowego hosta."}
            </DialogDescription>
          </DialogHeader>
          <HostForm
            setModalOpen={setIsModalOpen}
            onAddHost={addHost}
            onUpdateHost={updateHost}
            editingHost={hostToEdit}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!hostToDelete} onOpenChange={(open) => !open && setHostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć?</AlertDialogTitle>
            <AlertDialogDescription>
              Tej operacji nie można cofnąć. Spowoduje to trwałe usunięcie hosta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setHostToDelete(null)}>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Usuń</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HostsPage;