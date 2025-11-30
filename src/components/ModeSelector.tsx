/**
 * ============================================================
 * COMPONENTE MODE SELECTOR
 * ============================================================
 * Este componente permite ao usuário selecionar entre os
 * diferentes modos do Pomodoro:
 * - Foco (25 min) - Sessão de trabalho/estudo
 * - Pausa (5 min) - Pausa curta entre sessões
 * - Pausa Longa (15 min) - Pausa após 4 sessões de foco
 * 
 * O design usa o padrão de "pill buttons" (botões em formato
 * de pílula) com fundo que destaca a opção selecionada.
 * ============================================================
 */

import { cn } from "@/lib/utils";

/**
 * Tipo que representa os modos possíveis do Pomodoro
 */
type Mode = "work" | "break" | "longBreak";

/**
 * Props do componente ModeSelector
 * @property currentMode - Modo atualmente selecionado
 * @property onModeChange - Callback chamado quando um modo é selecionado
 */
interface ModeSelectorProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
}

/**
 * Configuração dos modos disponíveis
 * Cada modo tem uma chave (id), label em português e duração
 */
const modes: { key: Mode; label: string; time: string }[] = [
  { key: "work", label: "Foco", time: "25 min" },
  { key: "break", label: "Pausa", time: "5 min" },
  { key: "longBreak", label: "Pausa Longa", time: "15 min" },
];

/**
 * Componente que exibe os botões de seleção de modo
 * 
 * Comportamento responsivo:
 * - Desktop (sm+): mostra o label (ex: "Foco")
 * - Mobile: mostra o tempo (ex: "25 min")
 */
const ModeSelector = ({ currentMode, onModeChange }: ModeSelectorProps) => {
  return (
    // Container com fundo semi-transparente e bordas arredondadas
    <div className="flex items-center gap-2 p-1.5 bg-secondary/50 rounded-full">
      {/* Itera sobre os modos e cria um botão para cada */}
      {modes.map((mode) => (
        <button
          key={mode.key}
          onClick={() => onModeChange(mode.key)}
          className={cn(
            // Estilos base do botão
            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
            // Estilos condicionais baseados no modo selecionado
            currentMode === mode.key
              ? "bg-card text-foreground shadow-card" // Modo ativo: fundo destacado
              : "text-muted-foreground hover:text-foreground" // Modo inativo: texto suave
          )}
          aria-pressed={currentMode === mode.key}
          aria-label={`Selecionar modo ${mode.label}`}
        >
          {/* Label visível apenas em telas maiores (sm+) */}
          <span className="hidden sm:inline">{mode.label}</span>
          
          {/* Tempo visível apenas em telas pequenas (mobile) */}
          <span className="sm:hidden">{mode.time}</span>
        </button>
      ))}
    </div>
  );
};

export default ModeSelector;
