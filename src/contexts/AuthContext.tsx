/**
 * ============================================================
 * CONTEXTO DE AUTENTICAÇÃO
 * ============================================================
 * Este arquivo gerencia o estado de autenticação do usuário
 * em toda a aplicação. Utiliza o Context API do React para
 * compartilhar o estado do usuário entre todos os componentes.
 * ============================================================
 */

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Interface que define o formato do contexto de autenticação
 * @property user - Objeto do usuário autenticado ou null
 * @property session - Sessão atual do usuário ou null
 * @property loading - Indica se está carregando o estado de autenticação
 * @property signUp - Função para criar nova conta
 * @property signIn - Função para fazer login
 * @property signOut - Função para fazer logout
 */
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

/**
 * Cria o contexto de autenticação com valor inicial undefined
 * O contexto será preenchido pelo AuthProvider
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Props do componente AuthProvider
 * @property children - Componentes filhos que terão acesso ao contexto
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Componente Provider que envolve a aplicação
 * Fornece o estado de autenticação para todos os componentes filhos
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Estado do usuário autenticado
  const [user, setUser] = useState<User | null>(null);
  // Estado da sessão (contém tokens de autenticação)
  const [session, setSession] = useState<Session | null>(null);
  // Estado de loading enquanto verifica autenticação
  const [loading, setLoading] = useState(true);

  /**
   * useEffect para configurar o listener de mudanças na autenticação
   * Este hook é executado uma vez quando o componente é montado
   */
  useEffect(() => {
    // Configura o listener PRIMEIRO para não perder eventos
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        // Atualiza o estado com a sessão e usuário atuais
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    );

    // DEPOIS verifica se já existe uma sessão ativa
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setLoading(false);
    });

    // Limpa o listener quando o componente é desmontado
    return () => subscription.unsubscribe();
  }, []);

  /**
   * Função para criar uma nova conta de usuário
   * @param email - Email do usuário
   * @param password - Senha do usuário
   * @param name - Nome do usuário (será salvo nos metadados)
   * @returns Objeto com possível erro
   */
  const signUp = async (email: string, password: string, name: string) => {
    // URL de redirecionamento após confirmação de email
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        // Metadados do usuário que serão usados pelo trigger
        data: {
          name,
        },
      },
    });
    
    return { error };
  };

  /**
   * Função para fazer login com email e senha
   * @param email - Email do usuário
   * @param password - Senha do usuário
   * @returns Objeto com possível erro
   */
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  /**
   * Função para fazer logout do usuário
   * Remove a sessão e limpa os estados
   */
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  // Valor do contexto que será fornecido aos componentes filhos
  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook customizado para usar o contexto de autenticação
 * Deve ser usado dentro de um AuthProvider
 * @throws Error se usado fora do AuthProvider
 * @returns Contexto de autenticação
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  
  return context;
};
