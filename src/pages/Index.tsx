import ScaleMonitor from "./scale/ScaleMonitor";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Interfejs wagi Rinstrum C320</h1>
          <p className="text-gray-600">
            Prosty interfejs do odczytu masy przez NP301 (RS232 → TCP) — backend (Rust) łączy się z konwerterem,
            frontend odbiera odczyty przez WebSocket.
          </p>
        </header>

        <main>
          <ScaleMonitor />
        </main>

        <footer className="mt-8">
          <MadeWithDyad />
        </footer>
      </div>
    </div>
  );
};

export default Index;