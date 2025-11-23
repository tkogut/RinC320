import React from 'react';

const IndexPage = () => {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold">Strona testowa</h1>
      <p className="mt-2 text-gray-600">
        Jeśli widzisz tę stronę, podstawowa konfiguracja aplikacji działa poprawnie.
      </p>
      <p className="mt-4 text-sm text-gray-500">
        Ten widok jest częścią procesu debugowania uporczywego błędu kompilacji.
      </p>
    </div>
  );
};

export default IndexPage;