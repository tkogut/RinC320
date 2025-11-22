import ConfigurationForm from "./ConfigurationForm";

const NewConfigurationPage = () => {
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <header className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Nowa Konfiguracja Wagi</h1>
          <p className="text-gray-600">
            Wprowadź szczegóły połączenia z nową wagą.
          </p>
        </header>
        <main>
          <ConfigurationForm />
        </main>
      </div>
    </div>
  );
};

export default NewConfigurationPage;