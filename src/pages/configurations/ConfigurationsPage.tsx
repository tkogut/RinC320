import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, Search, ArrowUpDown, PlusCircle } from "lucide-react";
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
import ScaleForm from "./ScaleForm";
import { useAppContext } from "@/context/AppContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import type { ConnectionType, ScaleConfig } from "@/types";
import { showSuccess } from "@/utils/toast";
import StatusBadge from "@/components/ui/StatusBadge";

const ConfigurationsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<string | null>(null);
  const [configToEdit, setConfigToEdit] = useState<ScaleConfig | null>(null);
  const { configurations, hosts, deleteConfiguration } = useAppContext();
  const navigate = useNavigate();

  const displayConnectionType = (type?: ConnectionType) => {
    if (type === 'tcp') return 'ETHERNET';
    if (type === 'serial') return 'SERIAL';
    return '-';
  };

  const handleDelete = () => {
    if (configToDelete) {
      deleteConfiguration(configToDelete);
      showSuccess("Konfiguracja wagi została usunięta.");
      setConfigToDelete(null);
    }
  };

  const handleAddClick = () => {
    setConfigToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (config: ScaleConfig) => {
    setConfigToEdit(config);
    setIsModalOpen(true);
  };

  const handleMonitorClick = (configId: string) => {
    navigate(`/scales/monitor/${configId}`);
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
          <Button onClick={handleAddClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Dodaj wagę
          </Button>
        </div>
      </header>

      <main>
        <Card>
          <CardContent className="p-0">
            {configurations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>Brak zdefiniowanych wag. Kliknij "Dodaj wagę", aby rozpocząć.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" size="sm">
                        Nazwa <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>Typ połączenia</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configurations.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell className="font-medium">{config.name}</TableCell>
                      <TableCell>{hosts.find(h => h.id === config.hostId)?.name || 'N/A'}</TableCell>
                      <TableCell>{displayConnectionType(config.connectionType)}</TableCell>
                      <TableCell>
                        <StatusBadge isActive={config.isEnabled} />
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleMonitorClick(config.id)} title="Monitoruj">
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(config)} title="Edytuj">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setConfigToDelete(config.id)} title="Usuń">
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
        <DialogContent className="sm:max-w-[600px] h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{configToEdit ? "Edytuj konfigurację wagi" : "Nowa konfiguracja wagi"}</DialogTitle>
            <DialogDescription>
              {configToEdit ? "Zmień szczegóły poniżej." : "Wprowadź szczegóły dla nowej wagi."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <ScaleForm setModalOpen={setIsModalOpen} editingConfig={configToEdit} />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!configToDelete} onOpenChange={(open) => !open && setConfigToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć?</AlertDialogTitle>
            <AlertDialogDescription>
              Tej operacji nie można cofnąć. Spowoduje to trwałe usunięcie konfiguracji wagi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfigToDelete(null)}>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Usuń</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ConfigurationsPage;