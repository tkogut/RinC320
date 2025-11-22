import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-4xl font-bold mb-2">ScaleIT - Panel Zarządzania</h1>
          <p className="text-gray-600">
            Zarządzaj konfiguracjami wag i monitoruj ich odczyty.
          </p>
        </header>

        <main className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Zarządzanie Konfiguracjami</CardTitle>
              <CardDescription>
                Dodawaj, edytuj i zarządzaj połączeniami z wagami.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Przejdź do panelu konfiguracji, aby zdefiniować nowe połączenia z wagami lub zarządzać istniejącymi.
              </p>
              <Button asChild>
                <Link to="/configurations">Zarządzaj Konfiguracjami</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 border-dashed">
            <CardHeader>
              <CardTitle>Monitor Rinstrum C320 (Legacy)</CardTitle>
              <CardDescription>
                Bezpośredni dostęp do poprzedniego, statycznie skonfigurowanego monitora.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" asChild>
                <Link to="/monitor/rinstrum">Przejdź do monitora Rinstrum</Link>
              </Button>
            </CardContent>
          </Card>
        </main>

        <footer className="mt-8">
          <MadeWithDyad />
        </footer>
      </div>
    </div>
  );
};

export default Index;