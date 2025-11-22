import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

const ConfigurationsPage = () => {
  // Mock data for now
  const configurations = [];

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Konfiguracje Wag</h1>
            <p className="text-gray-600">
              Zarządzaj połączeniami z wagami pomiarowymi.
            </p>
          </div>
          <Button asChild>
            <Link to="/configurations/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Dodaj nową konfigurację
            </Link>
          </Button>
        </header>

        <main>
          <Card>
            <CardHeader>
              <CardTitle>Lista Konfiguracji</CardTitle>
              <CardDescription>
                Lista wszystkich zdefiniowanych połączeń z wagami.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {configurations.length === 0 ? (
                <div className="p-8 text-center text-gray-500 border-2 border-dashed rounded-lg">
                  <p>Brak zdefiniowanych konfiguracji.</p>
                  <p className="mt-2">
                    <Button variant="link" asChild>
                      <Link to="/configurations/new">Dodaj swoją pierwszą konfigurację</Link>
                    </Button>
                    , aby rozpocząć.
                  </p>
                </div>
              ) : (
                <div>
                  {/* TODO: Render list of configurations here */}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default ConfigurationsPage;