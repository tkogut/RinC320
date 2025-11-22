import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TemplatesPage = () => {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Szablony Grup</h1>
        <p className="text-gray-600">
          Zarządzaj szablonami dla grup I/O.
        </p>
      </header>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Lista Szablonów</CardTitle>
            <CardDescription>
              Ta sekcja jest w budowie.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-8 text-center text-gray-500 border-2 border-dashed rounded-lg">
              <p>Wkrótce pojawi się tutaj zarządzanie szablonami grup.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TemplatesPage;