import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { OfflineBanner } from "@/components/OfflineBanner";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import GoalDetails from "@/pages/GoalDetails";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/app" component={Dashboard} />
      <Route path="/app/goal/:id" component={GoalDetails} />
      <Route path="/app/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <OfflineBanner />
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
