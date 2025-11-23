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
import GroupForm from "./GroupForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppContext } from "@/context/AppContext";
import { Input } from "@/components/ui/input";
import type { IoGroup } from "@/types";
import { showSuccess } from "@/utils/toast";

const GroupsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<IoGroup | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const { groups, deleteGroup, devices } = useAppContext();

  const getDeviceName = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    return device ? device.name : "Nieznane urządzenie";
  };

  const handleAddClick = () => {
    setGroupToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (group: IoGroup) => {
    setGroupToEdit(group);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (groupToDelete) {
      deleteGroup(groupToDelete);
      showSuccess("Grupa I/O została usunięta.");
      setGroupToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-dark">Grupy I/O</h1>
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
            Dodaj grupę
          </Button>
        </div>
      </header>

      <main>
        <Card>
          <CardContent className="p-0">
            {groups.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>Brak zdefiniowanych grup I/O. Kliknij "Dodaj grupę", aby rozpocząć.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nazwa</TableHead>
                    <TableHead>Urządzenie I/O</TableHead>
                    <TableHead>Opis</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => (
                    <TableRow key={group.id} className="hover:bg-gray-100 even:bg-gray-50/50">
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>{getDeviceName(group.deviceId)}</TableCell>
                      <TableCell>{group.description || "-"}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" className="text-success-green hover:bg-success-green/10 hover:text-success-green" onClick={() => handleEditClick(group)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-danger-red hover:bg-danger-red/10 hover:text-danger-red" onClick={() => setGroupToDelete(group.id)}>
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
            <DialogTitle>{groupToEdit ? "Edytuj grupę I/O" : "Szczegóły grupy I/O"}</DialogTitle>
            <DialogDescription>
              {groupToEdit ? "Zmień dane grupy I/O." : "Wprowadź dane nowej grupy I/O."}
            </DialogDescription>
          </DialogHeader>
          <GroupForm
            setModalOpen={setIsModalOpen}
            editingGroup={groupToEdit}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!groupToDelete} onOpenChange={(open) => !open && setGroupToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć?</AlertDialogTitle>
            <AlertDialogDescription>
              Tej operacji nie można cofnąć. Spowoduje to trwałe usunięcie grupy I/O.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setGroupToDelete(null)}>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Usuń</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GroupsPage;