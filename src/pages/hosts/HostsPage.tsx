import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import HostForm from "./HostForm";

const HostsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            <HostForm setModalOpen={setIsModalOpen} />
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
          </Header>
          <CardContent>
            <div className="p-8 text-center text-gray-500 border-2 border-dashed rounded-lg">
              <p>Brak zdefiniowanych hostów.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default HostsPage;