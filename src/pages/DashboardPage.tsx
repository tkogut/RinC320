import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MadeWithDyad } from "@/components/made-with-dyad";

const DashboardPage = () => {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Witaj w panelu zarządzania ScaleIT.
        </p>
      </header>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Przegląd Systemu</CardTitle>
            <CardDescription>
              Główne metryki i statusy systemu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-8 text-center text-gray-500 border-2 border-dashed rounded-lg">
              <p>Główny panel (dashboard) jest w budowie.</p>
            </div>
          </CardContent>
        </Card>
      </main>
      <footer className="mt-8">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default DashboardPage;