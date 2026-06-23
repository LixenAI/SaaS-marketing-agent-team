import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OperatorProvider, useOperator } from "@/lib/operator";
import { Shell } from "@/components/Shell";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Agents from "@/pages/Agents";
import Autopilot from "@/pages/Autopilot";
import Workflows from "@/pages/Workflows";
import Integrations from "@/pages/Integrations";
import Audit from "@/pages/Audit";
import NotFound from "@/pages/not-found";

function AppRouter() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/agents" component={Agents} />
        <Route path="/autopilot" component={Autopilot} />
        <Route path="/workflows" component={Workflows} />
        <Route path="/integrations" component={Integrations} />
        <Route path="/audit" component={Audit} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

// Full-app login gate: until an operator token is verified, ONLY the branded
// sign-in is rendered. Direct hash routes also fall through to the gate.
function Gate() {
  const { token } = useOperator();
  if (!token) return <Login />;
  return (
    <Router hook={useHashLocation}>
      <AppRouter />
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <OperatorProvider>
          <Gate />
        </OperatorProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
