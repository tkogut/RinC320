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

        <main>
          <Card>
            <CardHeader>
              <CardTitle>Konfiguracje Wag</CardTitle>
              <CardDescription>
                Tutaj w przyszłości pojawi się lista skonfigurowanych wag.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-gray-500 border-2 border-dashed rounded-lg">
                Lista konfiguracji wag jest w budowie.
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  Na razie możesz przejść do istniejącego monitora dla wagi Rinstrum C320.
                </p>
                <Button asChild>
                  <Link to="/monitor/rinstrum">Przejdź do monitora Rinstrum</Link>
                </Button>
              </div>
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