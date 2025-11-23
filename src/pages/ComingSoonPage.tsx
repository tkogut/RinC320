import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";
import { useLocation } from "react-router-dom";

const ComingSoonPage = () => {
  const location = useLocation();
  const pageName = location.pathname.replace('/', '').replace(/-/g, ' ');

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-4xl font-bold mb-2 capitalize">{pageName}</h1>
        <p className="text-gray-600">
          Ta strona jest w budowie.
        </p>
      </header>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Wkrótce</CardTitle>
            <CardDescription>
              Pracujemy nad tą sekcją. Sprawdź ponownie później!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-8 text-center text-gray-500 border-2 border-dashed rounded-lg">
              <Construction className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>Funkcjonalność dla "{pageName}" zostanie wkrótce dodana.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ComingSoonPage;