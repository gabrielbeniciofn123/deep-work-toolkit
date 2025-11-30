/**
 * ============================================================
 * COMPONENTE TASK INPUT
 * ============================================================
 * Este componente gerencia a lista de tarefas do Pomodoro.
 * 
 * Funcionalidades:
 * - Adicionar novas tarefas com input expansível
 * - Marcar tarefas como concluídas (visual de check)
 * - Remover tarefas da lista
 * - Estado vazio com mensagem amigável
 * 
 * O design usa cards individuais para cada tarefa com
 * interações de hover e animações suaves.
 * ============================================================
 */

import { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Interface que define a estrutura de uma tarefa
 * @property id - Identificador único (UUID)
 * @property text - Texto/descrição da tarefa
 * @property completed - Se a tarefa foi concluída
 */
interface Task {
  id: string;
  text: string;
  completed: boolean;
}

/**
 * Props do componente TaskInput
 * @property tasks - Array de tarefas atuais
 * @property onAddTask - Callback para adicionar nova tarefa
 * @property onToggleTask - Callback para alternar status de conclusão
 * @property onDeleteTask - Callback para remover tarefa
 */
interface TaskInputProps {
  tasks: Task[];
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

/**
 * Componente que gerencia a lista de tarefas
 * Inclui formulário expansível e lista interativa
 */
const TaskInput = ({ tasks, onAddTask, onToggleTask, onDeleteTask }: TaskInputProps) => {
  // ============== ESTADOS ==============
  
  /**
   * Texto da nova tarefa sendo digitada
   */
  const [newTask, setNewTask] = useState("");
  
  /**
   * Controla se o formulário de adição está visível
   * O formulário aparece ao clicar em "Adicionar"
   */
  const [isAdding, setIsAdding] = useState(false);

  // ============== HANDLERS ==============
  
  /**
   * Manipula o envio do formulário de nova tarefa
   * Adiciona a tarefa se o texto não estiver vazio
   * @param e - Evento do formulário
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verifica se há texto (remove espaços extras)
    if (newTask.trim()) {
      onAddTask(newTask.trim());
      setNewTask(""); // Limpa o input
      setIsAdding(false); // Fecha o formulário
    }
  };

  // ============== RENDERIZAÇÃO ==============
  
  return (
    <div className="w-full max-w-md space-y-3">
      {/* ============== CABEÇALHO ============== */}
      <div className="flex items-center justify-between">
        {/* Título da seção */}
        <h3 className="text-sm font-semibold text-foreground">Tarefas de Hoje</h3>
        
        {/* Botão "Adicionar" - visível apenas quando o formulário está fechado */}
        {!isAdding && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="h-8 text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        )}
      </div>

      {/* ============== FORMULÁRIO DE NOVA TAREFA ============== */}
      {/* Renderizado condicionalmente quando isAdding é true */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="flex gap-2 fade-in">
          {/* Input de texto com foco automático */}
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="O que você vai estudar?"
            className="flex-1"
            autoFocus
          />
          
          {/* Botão de confirmar */}
          <Button type="submit" size="sm">
            Adicionar
          </Button>
          
          {/* Botão de cancelar - fecha o formulário */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsAdding(false);
              setNewTask("");
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </form>
      )}

      {/* ============== LISTA DE TAREFAS ============== */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              // Estilos base do card da tarefa
              "flex items-center gap-3 p-3 rounded-lg bg-card border border-border transition-all duration-200 hover:shadow-card",
              // Reduz opacidade se a tarefa está completa
              task.completed && "opacity-60"
            )}
          >
            {/* ============== CHECKBOX CUSTOMIZADO ============== */}
            {/* Botão circular que funciona como checkbox */}
            <button
              onClick={() => onToggleTask(task.id)}
              className={cn(
                // Estilos base do checkbox
                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                // Estilos condicionais baseados no estado
                task.completed
                  ? "bg-pomodoro-work border-pomodoro-work" // Completada: preenchido
                  : "border-muted-foreground/40 hover:border-pomodoro-work" // Pendente: apenas borda
              )}
              aria-label={
                task.completed
                  ? `Desmarcar tarefa: ${task.text}`
                  : `Marcar como concluída: ${task.text}`
              }
            >
              {/* Ícone de check visível apenas quando completada */}
              {task.completed && <Check className="w-3 h-3 text-primary-foreground" />}
            </button>
            
            {/* ============== TEXTO DA TAREFA ============== */}
            <span
              className={cn(
                // Estilos base do texto
                "flex-1 text-sm transition-all duration-200",
                // Aplica risco quando completada
                task.completed && "line-through text-muted-foreground"
              )}
            >
              {task.text}
            </span>
            
            {/* ============== BOTÃO DE DELETAR ============== */}
            <button
              onClick={() => onDeleteTask(task.id)}
              className="text-muted-foreground/40 hover:text-destructive transition-colors"
              aria-label={`Remover tarefa: ${task.text}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* ============== ESTADO VAZIO ============== */}
        {/* Mensagem exibida quando não há tarefas e o formulário está fechado */}
        {tasks.length === 0 && !isAdding && (
          <p className="text-center text-sm text-muted-foreground py-4">
            Nenhuma tarefa adicionada
          </p>
        )}
      </div>
    </div>
  );
};

export default TaskInput;
