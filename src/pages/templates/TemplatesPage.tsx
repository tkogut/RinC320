import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, Search, Layers, Sparkles } from "lucide-react";
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
import TemplateForm from "./TemplateForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppContext } from "@/context/AppContext";
import { Input } from "@/components/ui/input";
import type { IoGroupTemplate } from "@/types";
import { showSuccess } from "@/utils/toast";
import StatusBadge from "@/components/ui/StatusBadge";

const TemplatesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<IoGroupTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const { templates, deleteTemplate, groups } = useAppContext(); // Get groups to check template usage

  const handleAddClick = () => {
    setTemplateToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (template: IoGroupTemplate) => {
    setTemplateToEdit(template);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (templateToDelete) {
      deleteTemplate(templateToDelete);
      showSuccess("Szablon został usunięty.");
      setTemplateToDelete(null);
    }
  };

  const handleGenerateClick = () => {
    showSuccess("Funkcja generowania szablonu zostanie wkrótce zaimplementowana!");
  };

  const isTemplateUsed = (templateId: string) => {
    return groups.some(group => group.templateId === templateId);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-dark">Szablony Grup I/O</h1>
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
            Dodaj szablon
          </Button>
          <Button onClick={handleGenerateClick} variant="secondary">
            <Sparkles className="mr-2 h-4 w-4" />
            Wygeneruj
          </Button>
        </div>
      </header>

      <main>
        <Card>
          <CardContent className="p-0">
            {templates.length === 0 ? (
              <div className="p-8 text-center text-gray-500 border-2 border-dashed rounded-lg m-4">
                <Layers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold">Brak zdefiniowanych szablonów</h2>
                <p className="mt-2">Kliknij "Dodaj szablon", aby stworzyć pierwszy szablon I/O.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nazwa szablonu</TableHead>
                    <TableHead>Wejścia</TableHead>
                    <TableHead>Wyjścia</TableHead>
                    <TableHead>Użyty</TableHead> {/* New column */}
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{template.inputs.length}</TableCell>
                      <TableCell>{template.outputs.length}</TableCell>
                      <TableCell>
                        <StatusBadge isActive={isTemplateUsed(template.id)} />
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(template)} title="Edytuj">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setTemplateToDelete(template.id)} title="Usuń">
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
            <DialogTitle>{templateToEdit ? "Edytuj szablon" : "Nowy szablon I/O"}</DialogTitle>
            <DialogDescription>
              {templateToEdit ? "Zmień szczegóły szablonu." : "Wprowadź szczegóły dla nowego szablonu."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <TemplateForm setModalOpen={setIsModalOpen} editingTemplate={templateToEdit} />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!templateToDelete} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć?</AlertDialogTitle>
            <AlertDialogDescription>
              Tej operacji nie można cofnąć. Spowoduje to trwałe usunięcie szablonu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTemplateToDelete(null)}>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Usuń</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TemplatesPage;