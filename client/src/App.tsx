import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "@/pages/home";
import CreativeFlow from "@/pages/creative-flow";
import CraftSoulHug from "@/pages/craft-soul-hug";
import AudioHug from "@/pages/audio-hug";
import AudioHugTest from "@/pages/audio-hug-test";
import AudioHugTestFork from "@/pages/audio-hug-test-fork";
import MyHugs from "@/pages/my-hugs";
import HugPlayback from "@/pages/hug-playback";
import AdminDashboard from "@/pages/admin-dashboard";
import PricingPage from "@/pages/pricing";
import NotFound from "@/pages/not-found";
import AuthModal from "@/components/auth/AuthModal";
import UserProfile from "@/components/auth/UserProfile";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/creative-flow" component={CreativeFlow} />
      <Route path="/craft-soul-hug" component={CraftSoulHug} />
      <Route path="/audio-hug" component={AudioHug} />
      <Route path="/audio-hug-test" component={AudioHugTest} />
      <Route path="/audio-hug-test-fork" component={AudioHugTestFork} />
      <Route path="/my-hugs" component={MyHugs} />
      <Route path="/hug/:id" component={HugPlayback} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/pricing" component={PricingPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen">
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;