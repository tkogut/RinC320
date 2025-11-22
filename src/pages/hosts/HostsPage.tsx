import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const HostsPage = () => {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Hosty</h1>
        <p className="text-gray-600">
          Zarządzaj hostami w systemie.
        </p>
      </header>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Lista Hostów</CardTitle>
            <CardDescription>
              Ta sekcja jest w budowie.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-8 text-center text-gray-500 border-2 border-dashed rounded-lg">
              <p>Wkrótce pojawi się tutaj zarządzanie hostami.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default HostsPage;