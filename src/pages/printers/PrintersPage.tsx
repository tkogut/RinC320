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
import PrinterForm from "./PrinterForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppContext } from "@/context/AppContext";
import { Input } from "@/components/ui/input";
import type { Printer } from "@/types";
import { showSuccess } from "@/utils/toast";

const PrintersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [printerToEdit, setPrinterToEdit] = useState<Printer | null>(null);
  const [printerToDelete, setPrinterToDelete] = useState<string | null>(null);
  const { printers, deletePrinter, hosts } = useAppContext();

  const getHostName = (hostId: string) => {
    const host = hosts.find(h => h.id === hostId);
    return host ? host.name : "Nieznany host";
  };

  const handleAddClick = () => {
    setPrinterToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (printer: Printer) => {
    setPrinterToEdit(printer);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (printerToDelete) {
      deletePrinter(printerToDelete);
      showSuccess("Drukarka została usunięta.");
      setPrinterToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-dark">Drukarki</h1>
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
            Dodaj drukarkę
          </Button>
        </div>
      </header>

      <main>
        <Card>
          <CardContent className="p-0">
            {printers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>Brak zdefiniowanych drukarek. Kliknij "Dodaj drukarkę", aby rozpocząć.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nazwa</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>Opis</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {printers.map((printer) => (
                    <TableRow key={printer.id} className="hover:bg-gray-100 even:bg-gray-50/50">
                      <TableCell className="font-medium">{printer.name}</TableCell>
                      <TableCell>{getHostName(printer.hostId)}</TableCell>
                      <TableCell>{printer.description || "-"}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" className="text-success-green hover:bg-success-green/10 hover:text-success-green" onClick={() => handleEditClick(printer)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-danger-red hover:bg-danger-red/10 hover:text-danger-red" onClick={() => setPrinterToDelete(printer.id)}>
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
            <DialogTitle>{printerToEdit ? "Edytuj drukarkę" : "Szczegóły drukarki"}</DialogTitle>
            <DialogDescription>
              {printerToEdit ? "Zmień dane drukarki." : "Wprowadź dane nowej drukarki."}
            </DialogDescription>
          </DialogHeader>
          <PrinterForm
            setModalOpen={setIsModalOpen}
            editingPrinter={printerToEdit}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!printerToDelete} onOpenChange={(open) => !open && setPrinterToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć?</AlertDialogTitle>
            <AlertDialogDescription>
              Tej operacji nie można cofnąć. Spowoduje to trwałe usunięcie drukarki.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPrinterToDelete(null)}>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Usuń</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PrintersPage;