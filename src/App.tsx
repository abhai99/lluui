import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { BottomNav } from "./components/BottomNav";
import Index from "./pages/Index";
import PaymentSuccess from "./pages/PaymentSuccess";
import { AdminDashboard } from "./pages/AdminDashboard";
import ContentPage from "./pages/ContentPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

console.log('🚀 SYSTEM UPDATE: Version 5.25 - Date Fix & JS Execution');
console.log('Build Timestamp:', new Date().toISOString());

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/content/:id" element={<ContentPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
