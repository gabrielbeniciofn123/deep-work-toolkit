/**
 * ============================================================
 * PÁGINA DE AUTENTICAÇÃO
 * ============================================================
 * Esta página permite que usuários façam login ou criem uma
 * nova conta. Contém formulários para ambos os fluxos e
 * validação básica dos campos.
 * ============================================================
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Clock, Mail, Lock, User } from "lucide-react";

/**
 * Componente da página de autenticação
 * Renderiza formulários de login e cadastro em abas
 */
const Auth = () => {
  // Hook de navegação do React Router
  const navigate = useNavigate();
  // Acessa o contexto de autenticação
  const { user, signIn, signUp, loading } = useAuth();

  // Estados para o formulário de login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Estados para o formulário de cadastro
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [signUpLoading, setSignUpLoading] = useState(false);

  /**
   * Redireciona para a home se o usuário já está autenticado
   */
  useEffect(() => {
    if (user && !loading) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  /**
   * Manipula o envio do formulário de login
   * @param e - Evento do formulário
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    // Validação básica
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      setLoginLoading(false);
      return;
    }

    // Tenta fazer login
    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      // Trata diferentes tipos de erro
      let errorMessage = "Erro ao fazer login";
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha incorretos";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Email ainda não confirmado";
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Bem-vindo!",
        description: "Login realizado com sucesso",
      });
      navigate("/");
    }

    setLoginLoading(false);
  };

  /**
   * Manipula o envio do formulário de cadastro
   * @param e - Evento do formulário
   */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpLoading(true);

    // Validação dos campos
    if (!signUpName || !signUpEmail || !signUpPassword || !signUpConfirmPassword) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      setSignUpLoading(false);
      return;
    }

    // Validação da senha
    if (signUpPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      setSignUpLoading(false);
      return;
    }

    // Verifica se as senhas coincidem
    if (signUpPassword !== signUpConfirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      setSignUpLoading(false);
      return;
    }

    // Tenta criar a conta
    const { error } = await signUp(signUpEmail, signUpPassword, signUpName);

    if (error) {
      // Trata diferentes tipos de erro
      let errorMessage = "Erro ao criar conta";
      if (error.message.includes("already registered")) {
        errorMessage = "Este email já está cadastrado";
      } else if (error.message.includes("invalid email")) {
        errorMessage = "Email inválido";
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Conta criada!",
        description: "Você já pode começar a usar o Pomodoro",
      });
      navigate("/");
    }

    setSignUpLoading(false);
  };

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Logo e título */}
      <div className="flex items-center gap-2 mb-8 fade-in">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
          <Clock className="w-6 h-6 text-primary-foreground" />
        </div>
        <span className="font-bold text-2xl text-foreground">Pomodoro</span>
      </div>

      {/* Card com os formulários */}
      <Card className="w-full max-w-md fade-in" style={{ animationDelay: "0.1s" }}>
        <CardHeader className="text-center">
          <CardTitle>Bem-vindo</CardTitle>
          <CardDescription>
            Faça login ou crie uma conta para salvar seu progresso
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Abas para alternar entre login e cadastro */}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar Conta</TabsTrigger>
            </TabsList>

            {/* Conteúdo da aba de login */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Campo de email */}
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Campo de senha */}
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Botão de submit */}
                <Button type="submit" className="w-full" disabled={loginLoading}>
                  {loginLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            {/* Conteúdo da aba de cadastro */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Campo de nome */}
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Seu nome"
                      className="pl-10"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Campo de email */}
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Campo de senha */}
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      className="pl-10"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Campo de confirmação de senha */}
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirmar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="Digite a senha novamente"
                      className="pl-10"
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Botão de submit */}
                <Button type="submit" className="w-full" disabled={signUpLoading}>
                  {signUpLoading ? "Criando conta..." : "Criar Conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
};

export default Auth;
