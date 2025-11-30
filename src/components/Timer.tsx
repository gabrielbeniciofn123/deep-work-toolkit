/**
 * ============================================================
 * COMPONENTE TIMER
 * ============================================================
 * Este componente renderiza o timer visual do Pomodoro.
 * Exibe um anel de progresso circular usando SVG e o tempo
 * restante no formato MM:SS. Inclui efeitos visuais como
 * brilho de fundo que pulsa quando o timer está rodando.
 * ============================================================
 */

import { useEffect, useRef } from "react";

/**
 * Props do componente Timer
 * @property timeLeft - Tempo restante em segundos
 * @property totalTime - Tempo total do modo atual em segundos
 * @property isRunning - Se o timer está em execução
 * @property mode - Modo atual (work, break, longBreak)
 */
interface TimerProps {
  timeLeft: number;
  totalTime: number;
  isRunning: boolean;
  mode: "work" | "break" | "longBreak";
}

/**
 * Componente que exibe o timer visual
 * Usa SVG para criar um anel de progresso circular com animações
 */
const Timer = ({ timeLeft, totalTime, isRunning, mode }: TimerProps) => {
  // ============== CÁLCULOS DE TEMPO ==============
  
  /**
   * Converte o tempo restante em minutos e segundos
   * Ex: 125 segundos -> 2 minutos e 5 segundos
   */
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  /**
   * Calcula a porcentagem de progresso
   * Quanto do tempo total já passou (0-100)
   */
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  
  // ============== CONFIGURAÇÃO DO SVG ==============
  
  /**
   * Circunferência do círculo SVG
   * Calculada com a fórmula: 2 * PI * raio
   * O raio é 140 pixels
   */
  const circumference = 2 * Math.PI * 140;
  
  /**
   * Offset do traço do círculo
   * Controla quanto do círculo está preenchido
   * Começa no tamanho total e vai diminuindo conforme o progresso
   */
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // ============== FUNÇÕES DE COR ==============
  
  /**
   * Retorna a cor do traço baseada no modo atual
   * - work: cor primária do Pomodoro (laranja/vermelho)
   * - break: cor de pausa (verde)
   * - longBreak: cor de pausa longa (azul)
   */
  const getStrokeColor = () => {
    switch (mode) {
      case "work":
        return "hsl(var(--pomodoro-work))";
      case "break":
        return "hsl(var(--pomodoro-break))";
      case "longBreak":
        return "hsl(var(--pomodoro-long-break))";
    }
  };

  /**
   * Retorna a cor de fundo do anel (versão transparente)
   * Usa a mesma cor do modo mas com 10% de opacidade
   */
  const getBgColor = () => {
    switch (mode) {
      case "work":
        return "hsl(var(--pomodoro-work) / 0.1)";
      case "break":
        return "hsl(var(--pomodoro-break) / 0.1)";
      case "longBreak":
        return "hsl(var(--pomodoro-long-break) / 0.1)";
    }
  };

  // ============== RENDERIZAÇÃO ==============
  
  return (
    <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
      {/* ============== BRILHO DE FUNDO ============== */}
      {/* Efeito de glow que pulsa quando o timer está rodando */}
      <div 
        className={`absolute inset-0 rounded-full blur-3xl opacity-30 transition-all duration-500 ${
          isRunning ? "scale-110" : "scale-100"
        }`}
        style={{ backgroundColor: getStrokeColor() }}
      />
      
      {/* ============== SVG DO ANEL ============== */}
      {/* Rotacionado -90° para que o progresso comece do topo */}
      <svg className="absolute w-full h-full -rotate-90 transform">
        {/* Anel de fundo (cinza/transparente) */}
        <circle
          cx="50%"
          cy="50%"
          r="140"
          fill="none"
          stroke={getBgColor()}
          strokeWidth="8"
        />
        
        {/* Anel de progresso (colorido) */}
        <circle
          cx="50%"
          cy="50%"
          r="140"
          fill="none"
          stroke={getStrokeColor()}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="timer-ring"
          style={{
            // Adiciona efeito de brilho quando está rodando
            filter: isRunning ? `drop-shadow(0 0 10px ${getStrokeColor()})` : "none",
          }}
        />
      </svg>

      {/* ============== DISPLAY DE TEMPO ============== */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Tempo formatado como MM:SS */}
        <span className="timer-display text-6xl sm:text-7xl font-semibold tracking-tight text-foreground">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
        
        {/* Label do modo atual em português */}
        <span className="mt-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {mode === "work" ? "Foco" : mode === "break" ? "Pausa" : "Pausa Longa"}
        </span>
      </div>
    </div>
  );
};

export default Timer;
