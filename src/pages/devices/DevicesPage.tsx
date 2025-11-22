import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import IoDeviceForm from "./IoDeviceForm";

const DevicesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            <IoDeviceForm setModalOpen={setIsModalOpen} />
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
            <div className="p-8 text-center text-gray-500 border-2 border-dashed rounded-lg">
              <p>Brak zdefiniowanych urządzeń.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DevicesPage;