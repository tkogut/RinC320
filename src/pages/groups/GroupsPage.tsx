import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const GroupsPage = () => {
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
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Dodaj grupę
          </Button>
        </div>
      </header>
      <main>
        <Card>
          <CardContent>
            <div className="p-8 text-center text-gray-500 border-2 border-dashed rounded-lg mt-4">
              <p>Wkrótce pojawi się tutaj zarządzanie grupami I/O.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default GroupsPage;