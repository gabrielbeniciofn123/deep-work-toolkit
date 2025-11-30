/**
 * ============================================================
 * COMPONENTE CONTROLS
 * ============================================================
 * Este componente renderiza os botões de controle do timer:
 * - Reset: Reinicia o timer para o tempo inicial do modo
 * - Play/Pause: Alterna entre iniciar e pausar o timer
 * - Skip: Pula para o próximo modo (trabalho -> pausa ou vice-versa)
 * ============================================================
 */

import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Props do componente Controls
 * @property isRunning - Se o timer está em execução
 * @property onStart - Função chamada ao clicar em Play
 * @property onPause - Função chamada ao clicar em Pause
 * @property onReset - Função chamada ao clicar em Reset
 * @property onSkip - Função chamada ao clicar em Skip
 */
interface ControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
}

/**
 * Componente que exibe os controles do timer
 * Organiza três botões em uma linha horizontal com espaçamento uniforme
 */
const Controls = ({ isRunning, onStart, onPause, onReset, onSkip }: ControlsProps) => {
  return (
    <div className="flex items-center gap-3">
      {/* ============== BOTÃO RESET ============== */}
      {/* 
       * Reinicia o timer para o tempo inicial do modo atual
       * Estilo: botão secundário com ícone de seta circular
       */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onReset}
        className="w-12 h-12 rounded-full bg-secondary hover:bg-secondary/80 transition-all duration-200"
        aria-label="Reiniciar timer"
      >
        <RotateCcw className="w-5 h-5" />
      </Button>

      {/* ============== BOTÃO PLAY/PAUSE ============== */}
      {/* 
       * Botão principal que alterna entre iniciar e pausar
       * Maior que os outros para destaque visual
       * Inclui efeito de hover com escala
       */}
      <Button
        onClick={isRunning ? onPause : onStart}
        className="w-16 h-16 rounded-full shadow-timer hover:scale-105 transition-all duration-200"
        aria-label={isRunning ? "Pausar timer" : "Iniciar timer"}
      >
        {/* Mostra ícone de Pause quando rodando, Play quando parado */}
        {isRunning ? (
          <Pause className="w-6 h-6" />
        ) : (
          // ml-0.5 compensa visualmente o ícone de Play (triângulo)
          <Play className="w-6 h-6 ml-0.5" />
        )}
      </Button>

      {/* ============== BOTÃO SKIP ============== */}
      {/* 
       * Pula para o próximo modo sem esperar o timer acabar
       * Útil quando o usuário quer encerrar uma sessão antecipadamente
       */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onSkip}
        className="w-12 h-12 rounded-full bg-secondary hover:bg-secondary/80 transition-all duration-200"
        aria-label="Pular para próximo modo"
      >
        <SkipForward className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default Controls;
