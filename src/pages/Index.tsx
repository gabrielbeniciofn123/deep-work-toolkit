/**
 * ============================================================
 * PÁGINA PRINCIPAL - INDEX
 * ============================================================
 * Esta é a página principal da aplicação Pomodoro. Contém:
 * - Timer visual com seletor de modo
 * - Controles de play/pause/reset/skip
 * - Contador de sessões
 * - Lista de tarefas
 * - Navegação para relatório semanal e autenticação
 * ============================================================
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import Timer from "@/components/Timer";
import Controls from "@/components/Controls";
import ModeSelector from "@/components/ModeSelector";
import SessionCounter from "@/components/SessionCounter";
import TaskInput from "@/components/TaskInput";
import { usePomodoro } from "@/hooks/usePomodoro";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Clock, BarChart3, LogIn, LogOut, User } from "lucide-react";

/**
 * Interface que define a estrutura de uma tarefa
 * @property id - Identificador único da tarefa
 * @property text - Texto/descrição da tarefa
 * @property completed - Se a tarefa foi concluída
 */
interface Task {
  id: string;
  text: string;
  completed: boolean;
}

/**
 * Componente da página principal
 * Gerencia o timer Pomodoro e a lista de tarefas
 */
const Index = () => {
  // ============== HOOKS ==============
  
  /**
   * Hook de autenticação
   * Fornece informações do usuário e função de logout
   */
  const { user, signOut, loading: authLoading } = useAuth();

  /**
   * Estado para armazenar a tarefa atual (usada para salvar sessões)
   */
  const [currentTaskName, setCurrentTaskName] = useState("");

  /**
   * Hook do Pomodoro
   * Contém toda a lógica do timer e controles
   */
  const {
    mode,
    timeLeft,
    totalTime,
    isRunning,
    completedSessions,
    sessionsUntilLongBreak,
    handleModeChange,
    handleStart,
    handlePause,
    handleReset,
    handleSkip,
  } = usePomodoro({ currentTask: currentTaskName });

  // ============== ESTADOS ==============
  
  /**
   * Lista de tarefas do usuário
   * Armazenada localmente (poderia ser salva no banco futuramente)
   */
  const [tasks, setTasks] = useState<Task[]>([]);

  // ============== HANDLERS ==============
  
  /**
   * Adiciona uma nova tarefa à lista
   * @param text - Texto da tarefa a ser adicionada
   */
  const handleAddTask = (text: string) => {
    setTasks((prev) => [
      ...prev,
      { 
        id: crypto.randomUUID(), // Gera ID único
        text, 
        completed: false 
      },
    ]);
    // Define a nova tarefa como tarefa atual
    setCurrentTaskName(text);
  };

  /**
   * Alterna o estado de conclusão de uma tarefa
   * @param id - ID da tarefa a ser alternada
   */
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  /**
   * Remove uma tarefa da lista
   * @param id - ID da tarefa a ser removida
   */
  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  /**
   * Faz logout do usuário
   */
  const handleLogout = async () => {
    await signOut();
  };

  // ============== RENDERIZAÇÃO ==============
  
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* ============== HEADER ============== */}
      <header className="w-full px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Logo e título */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">
              PomôdoBeni
            </span>
          </div>

          {/* Navegação e autenticação */}
          <div className="flex items-center gap-2">
            {/* Mostra loading enquanto verifica autenticação */}
            {authLoading ? (
              <div className="animate-pulse w-20 h-9 bg-secondary rounded-md" />
            ) : user ? (
              /* Usuário logado: mostra relatório e logout */
              <>
                {/* Botão de relatório semanal */}
                <Link to="/report">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span className="hidden sm:inline">Relatório</span>
                  </Button>
                </Link>
                
                {/* Indicador de usuário e botão de logout */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    <User className="w-4 h-4 inline mr-1" />
                    {user.email?.split("@")[0]}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sair</span>
                  </Button>
                </div>
              </>
            ) : (
              /* Usuário não logado: mostra botão de login */
              <Link to="/auth">
                <Button variant="outline" size="sm" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Entrar
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ============== CONTEÚDO PRINCIPAL ============== */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-8">
        {/* Seletor de modo (Trabalho, Pausa, Pausa Longa) */}
        <div className="fade-in">
          <ModeSelector currentMode={mode} onModeChange={handleModeChange} />
        </div>

        {/* Timer visual circular */}
        <div className="fade-in" style={{ animationDelay: "0.1s" }}>
          <Timer
            timeLeft={timeLeft}
            totalTime={totalTime}
            isRunning={isRunning}
            mode={mode}
          />
        </div>

        {/* Controles (play/pause/reset/skip) */}
        <div className="fade-in" style={{ animationDelay: "0.2s" }}>
          <Controls
            isRunning={isRunning}
            onStart={handleStart}
            onPause={handlePause}
            onReset={handleReset}
            onSkip={handleSkip}
          />
        </div>

        {/* Contador de sessões completadas */}
        <div className="fade-in" style={{ animationDelay: "0.3s" }}>
          <SessionCounter
            completedSessions={completedSessions}
            sessionsUntilLongBreak={sessionsUntilLongBreak}
          />
        </div>

        {/* Input e lista de tarefas */}
        <div
          className="w-full max-w-md mt-4 fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <TaskInput
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />
        </div>

        {/* Aviso para salvar progresso */}
        {!user && !authLoading && (
          <div
            className="text-center text-sm text-muted-foreground fade-in"
            style={{ animationDelay: "0.5s" }}
          >
            <Link to="/auth" className="text-primary hover:underline">
              Faça login
            </Link>{" "}
            para salvar seu progresso e ver relatórios semanais
          </div>
        )}
      </div>

      {/* ============== FOOTER ============== */}
      <footer className="w-full px-6 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          PomôdoBeni — Foque por 25 minutos, descanse por 5
        </p>
      </footer>
    </main>
  );
};

export default Index;
