import { Suspense } from "react";
import SimulationClient from "./SimulationClient";
import { Loader2 } from "lucide-react";

export default function Page() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      }
    >
      <SimulationClient />
    </Suspense>
  );
}
