import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import HostForm from "./HostForm";
import type { Host } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const HostsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hosts, setHosts] = useState<Host[]>([]);

  const handleAddHost = (hostData: Omit<Host, "id">) => {
    const newHost: Host = {
      id: crypto.randomUUID(),
      ...hostData,
    };
    setHosts(prevHosts => [...prevHosts, newHost]);
  };

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Hosty</h1>
          <p className="text-gray-600">
            Zarządzaj hostami w systemie.
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Dodaj hosta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Szczegóły hosta</DialogTitle>
              <DialogDescription>
                Wprowadź dane nowego hosta.
              </DialogDescription>
            </DialogHeader>
            <HostForm setModalOpen={setIsModalOpen} onAddHost={handleAddHost} />
          </DialogContent>
        </Dialog>
      </header>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Lista Hostów</CardTitle>
            <CardDescription>
              Lista wszystkich zdefiniowanych hostów.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hosts.length === 0 ? (
              <div className="p-8 text-center text-gray-500 border-2 border-dashed rounded-lg">
                <p>Brak zdefiniowanych hostów.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nazwa</TableHead>
                    <TableHead>Adres IP</TableHead>
                    <TableHead>Port</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hosts.map((host) => (
                    <TableRow key={host.id}>
                      <TableCell className="font-medium">{host.name}</TableCell>
                      <TableCell>{host.ipAddress}</TableCell>
                      <TableCell>{host.port}</TableCell>
                      <TableCell>
                        <Badge variant={host.isActive ? "default" : "outline"}>
                          {host.isActive ? "Aktywny" : "Nieaktywny"}
                        </Badge>
                      </TableCell>
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

export default HostsPage;