/**
 * ============================================================
 * COMPONENTE RAIZ DA APLICAÇÃO
 * ============================================================
 * Este é o componente principal que configura:
 * - Providers globais (React Query, Tooltip, Auth)
 * - Sistema de notificações (Toaster, Sonner)
 * - Rotas da aplicação
 * ============================================================
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import WeeklyReport from "./pages/WeeklyReport";
import NotFound from "./pages/NotFound";

/**
 * Instância do QueryClient para React Query
 * Gerencia cache e estado de requisições assíncronas
 */
const queryClient = new QueryClient();

/**
 * Componente principal da aplicação
 * Estrutura os providers em ordem de dependência
 */
const App = () => (
  /**
   * QueryClientProvider: Fornece acesso ao React Query
   * Permite usar useQuery e useMutation em toda a app
   */
  <QueryClientProvider client={queryClient}>
    {/**
     * TooltipProvider: Habilita tooltips do Radix UI
     * Necessário para componentes que usam Tooltip
     */}
    <TooltipProvider>
      {/**
       * AuthProvider: Gerencia estado de autenticação
       * Fornece user, session, signIn, signUp, signOut
       */}
      <AuthProvider>
        {/**
         * Toaster: Sistema de notificações principal
         * Usado com o hook useToast
         */}
        <Toaster />
        
        {/**
         * Sonner: Sistema de notificações alternativo
         * Mais moderno, usado para notificações simples
         */}
        <Sonner />
        
        {/**
         * BrowserRouter: Habilita navegação client-side
         * Permite usar Link e useNavigate
         */}
        <BrowserRouter>
          {/**
           * Routes: Container para definição de rotas
           */}
          <Routes>
            {/**
             * Rota principal: Página do timer Pomodoro
             */}
            <Route path="/" element={<Index />} />
            
            {/**
             * Rota de autenticação: Login e cadastro
             */}
            <Route path="/auth" element={<Auth />} />
            
            {/**
             * Rota de relatório: Estatísticas semanais
             */}
            <Route path="/report" element={<WeeklyReport />} />
            
            {/**
             * Rota catch-all: Página 404 para rotas não encontradas
             * IMPORTANTE: Deve ser sempre a última rota
             */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
