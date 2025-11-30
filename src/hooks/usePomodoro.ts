/**
 * ============================================================
 * HOOK PERSONALIZADO - usePomodoro
 * ============================================================
 * Este hook gerencia toda a lógica do timer Pomodoro, incluindo:
 * - Controle de tempo (iniciar, pausar, resetar)
 * - Alternância entre modos (trabalho, pausa curta, pausa longa)
 * - Contagem de sessões completadas
 * - Notificações sonoras
 * - Salvamento de sessões no banco de dados
 * ============================================================
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tipos de modo do Pomodoro
 * - work: Sessão de trabalho/estudo (25 min)
 * - break: Pausa curta (5 min)
 * - longBreak: Pausa longa (15 min)
 */
type Mode = "work" | "break" | "longBreak";

/**
 * Duração de cada modo em segundos
 */
const TIMES = {
  work: 25 * 60,      // 25 minutos de foco
  break: 5 * 60,      // 5 minutos de pausa
  longBreak: 15 * 60, // 15 minutos de pausa longa
};

/**
 * Número de sessões de trabalho até a pausa longa
 */
const SESSIONS_UNTIL_LONG_BREAK = 4;

/**
 * Interface para props opcionais do hook
 * @property currentTask - Nome da tarefa atual (para salvar no banco)
 */
interface UsePomodoroProps {
  currentTask?: string;
}

/**
 * Hook principal do Pomodoro
 * @param props - Propriedades opcionais
 * @returns Objeto com estados e funções de controle
 */
export const usePomodoro = (props?: UsePomodoroProps) => {
  // ============== ESTADOS ==============
  
  // Modo atual do timer (trabalho, pausa curta ou pausa longa)
  const [mode, setMode] = useState<Mode>("work");
  
  // Tempo restante em segundos
  const [timeLeft, setTimeLeft] = useState(TIMES.work);
  
  // Indica se o timer está rodando
  const [isRunning, setIsRunning] = useState(false);
  
  // Contador de sessões de trabalho completadas
  const [completedSessions, setCompletedSessions] = useState(0);

  // ============== REFS ==============
  
  // Referência para o elemento de áudio (notificação)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Referência para o timestamp de quando o timer vai acabar
  // Usado para cálculo preciso mesmo quando a aba está minimizada
  const endTimeRef = useRef<number | null>(null);

  // ============== INICIALIZAÇÃO DO ÁUDIO ==============
  
  /**
   * Inicializa o elemento de áudio quando o componente monta
   * O áudio é pré-carregado para tocar imediatamente quando necessário
   */
  useEffect(() => {
    // Cria elemento de áudio com URL do som de notificação
    audioRef.current = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
    );
    // Define volume (70%)
    audioRef.current.volume = 0.7;
    // Pré-carrega o áudio para evitar delay
    audioRef.current.load();
  }, []);

  // ============== FUNÇÕES DE ÁUDIO ==============
  
  /**
   * Toca o som de notificação
   * Usa useCallback para evitar recriação desnecessária
   */
  const playNotification = useCallback(() => {
    if (audioRef.current) {
      // Reseta o áudio para o início (caso já tenha tocado antes)
      audioRef.current.currentTime = 0;
      // Tenta tocar o áudio (pode falhar por política do navegador)
      audioRef.current.play().catch((e) => {
        console.log("Falha ao tocar áudio:", e);
      });
    }
  }, []);

  // ============== FUNÇÕES DE CONTROLE ==============
  
  /**
   * Muda o modo do timer
   * @param newMode - Novo modo a ser definido
   */
  const handleModeChange = useCallback((newMode: Mode) => {
    setMode(newMode);
    setTimeLeft(TIMES[newMode]);
    setIsRunning(false);
    endTimeRef.current = null;
  }, []);

  /**
   * Inicia o timer
   * Calcula o timestamp de término baseado no tempo restante
   */
  const handleStart = useCallback(() => {
    // Calcula quando o timer vai terminar
    endTimeRef.current = Date.now() + timeLeft * 1000;
    setIsRunning(true);
  }, [timeLeft]);

  /**
   * Pausa o timer
   * Limpa a referência de tempo final
   */
  const handlePause = useCallback(() => {
    setIsRunning(false);
    endTimeRef.current = null;
  }, []);

  /**
   * Reseta o timer para o tempo inicial do modo atual
   */
  const handleReset = useCallback(() => {
    setTimeLeft(TIMES[mode]);
    setIsRunning(false);
    endTimeRef.current = null;
  }, [mode]);

  /**
   * Salva uma sessão de estudo completada no banco de dados
   * @param sessionMode - Modo da sessão (work, break, longBreak)
   */
  const saveSession = useCallback(async (sessionMode: Mode) => {
    try {
      // Busca o usuário atual da sessão do Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      // Só salva se houver usuário logado
      if (user) {
        const now = new Date();
        
        // Insere a sessão no banco de dados
        await supabase.from("study_sessions").insert({
          user_id: user.id,
          mode: sessionMode === "work" ? "pomodoro" : sessionMode,
          duration_minutes: Math.floor(TIMES[sessionMode] / 60),
          task_name: props?.currentTask || null,
          day_of_week: now.getDay(), // 0 = Domingo, 6 = Sábado
        });
      }
    } catch (error) {
      console.error("Erro ao salvar sessão:", error);
    }
  }, [props?.currentTask]);

  /**
   * Pula para o próximo modo
   * Após trabalho -> pausa (ou pausa longa a cada 4 sessões)
   * Após pausa -> trabalho
   */
  const handleSkip = useCallback(() => {
    if (mode === "work") {
      // Incrementa contador de sessões
      const newSessions = completedSessions + 1;
      setCompletedSessions(newSessions);

      // Salva a sessão de trabalho no banco
      saveSession("work");

      // Verifica se é hora da pausa longa (a cada 4 sessões)
      if (newSessions % SESSIONS_UNTIL_LONG_BREAK === 0) {
        handleModeChange("longBreak");
        toast({
          title: "🎉 Hora da pausa longa!",
          description: "Você completou 4 sessões. Descanse bem!",
        });
      } else {
        handleModeChange("break");
        toast({
          title: "☕ Hora da pausa!",
          description: "Ótimo trabalho! Descanse um pouco.",
        });
      }
    } else {
      // Após pausa, volta para modo de trabalho
      handleModeChange("work");
      toast({
        title: "💪 Vamos focar!",
        description: "Nova sessão de estudo iniciando.",
      });
    }
  }, [mode, completedSessions, handleModeChange, saveSession]);

  // ============== LÓGICA DO TIMER ==============
  
  /**
   * Effect principal do timer
   * Usa cálculo baseado em timestamp para precisão mesmo quando minimizado
   */
  useEffect(() => {
    // IDs dos loops de animação e intervalo
    let animationId: number;
    let intervalId: NodeJS.Timeout;

    /**
     * Função que atualiza o timer
     * Calcula o tempo restante baseado no timestamp final
     */
    const updateTimer = () => {
      if (!endTimeRef.current) return;

      // Calcula tempo restante em segundos
      const remaining = Math.max(
        0,
        Math.ceil((endTimeRef.current - Date.now()) / 1000)
      );
      setTimeLeft(remaining);

      // Se chegou a zero, finaliza a sessão
      if (remaining === 0) {
        setIsRunning(false);
        endTimeRef.current = null;
        playNotification();
        handleSkip();
      }
    };

    // Só executa se o timer estiver rodando
    if (isRunning) {
      /**
       * Loop de atualização usando requestAnimationFrame
       * Fornece atualizações suaves quando a aba está visível
       */
      const tick = () => {
        updateTimer();
        if (isRunning) {
          animationId = requestAnimationFrame(tick);
        }
      };
      animationId = requestAnimationFrame(tick);

      /**
       * Intervalo de backup para quando a aba está em segundo plano
       * Navegadores limitam requestAnimationFrame em abas minimizadas
       */
      intervalId = setInterval(updateTimer, 1000);
    }

    // Cleanup: cancela animação e intervalo quando desmonta ou deps mudam
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, handleSkip, playNotification]);

  // ============== TRATAMENTO DE VISIBILIDADE ==============
  
  /**
   * Effect para recalcular tempo quando a aba volta a ficar visível
   * Garante que o timer mostre o tempo correto após minimizar
   */
  useEffect(() => {
    /**
     * Função chamada quando a visibilidade da aba muda
     */
    const handleVisibilityChange = () => {
      // Só processa se a aba ficou visível e o timer está rodando
      if (
        document.visibilityState === "visible" &&
        isRunning &&
        endTimeRef.current
      ) {
        // Recalcula o tempo restante
        const remaining = Math.max(
          0,
          Math.ceil((endTimeRef.current - Date.now()) / 1000)
        );
        setTimeLeft(remaining);

        // Se o tempo já acabou enquanto estava minimizado
        if (remaining === 0) {
          setIsRunning(false);
          endTimeRef.current = null;
          playNotification();
          handleSkip();
        }
      }
    };

    // Adiciona listener para mudanças de visibilidade
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Remove listener quando desmonta
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isRunning, handleSkip, playNotification]);

  // ============== ATUALIZAÇÃO DO TÍTULO ==============
  
  /**
   * Effect para atualizar o título da página com o tempo restante
   * Permite ver o timer mesmo quando a aba está minimizada
   */
  useEffect(() => {
    // Formata minutos e segundos com zero à esquerda
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeString = `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
    
    // Define o label do modo em português
    const modeLabel =
      mode === "work" ? "Foco" : mode === "break" ? "Pausa" : "Pausa Longa";
    
    // Atualiza o título do documento
    document.title = `${timeString} - ${modeLabel} | Pomodoro`;
  }, [timeLeft, mode]);

  // ============== RETORNO DO HOOK ==============
  
  /**
   * Retorna todos os estados e funções necessários
   * para controlar o timer nos componentes
   */
  return {
    mode,                                    // Modo atual
    timeLeft,                               // Tempo restante em segundos
    totalTime: TIMES[mode],                 // Tempo total do modo atual
    isRunning,                              // Se está rodando
    completedSessions,                      // Sessões completadas
    sessionsUntilLongBreak: SESSIONS_UNTIL_LONG_BREAK, // Sessões até pausa longa
    handleModeChange,                       // Função para mudar modo
    handleStart,                            // Função para iniciar
    handlePause,                            // Função para pausar
    handleReset,                            // Função para resetar
    handleSkip,                             // Função para pular
  };
};
