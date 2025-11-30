/**
 * ============================================================
 * COMPONENTE SESSION COUNTER
 * ============================================================
 * Este componente exibe o progresso das sessões Pomodoro.
 * 
 * Funcionalidades:
 * - Mostra indicadores visuais (círculos) para cada sessão do ciclo
 * - Círculos preenchidos = sessões completadas
 * - Círculos vazios = sessões pendentes
 * - Contador numérico do total de sessões
 * 
 * O ciclo padrão do Pomodoro é de 4 sessões de trabalho,
 * após as quais o usuário recebe uma pausa longa.
 * ============================================================
 */

import { Circle, CheckCircle2 } from "lucide-react";

/**
 * Props do componente SessionCounter
 * @property completedSessions - Total de sessões completadas (acumulativo)
 * @property sessionsUntilLongBreak - Número de sessões em cada ciclo (geralmente 4)
 */
interface SessionCounterProps {
  completedSessions: number;
  sessionsUntilLongBreak: number;
}

/**
 * Componente que exibe o contador visual de sessões
 * 
 * Exemplo visual com 3 de 4 sessões completadas:
 * [✓] [✓] [✓] [○]
 * "3 sessões completadas"
 */
const SessionCounter = ({ completedSessions, sessionsUntilLongBreak }: SessionCounterProps) => {
  /**
   * Cria um array com o número de posições do ciclo
   * Ex: sessionsUntilLongBreak = 4 -> [0, 1, 2, 3]
   */
  const sessions = Array.from({ length: sessionsUntilLongBreak }, (_, i) => i);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* ============== INDICADORES VISUAIS ============== */}
      <div className="flex items-center gap-2">
        {/* Mapeia cada posição do ciclo para um indicador */}
        {sessions.map((_, index) => (
          <div
            key={index}
            className={`transition-all duration-300 ${
              // Aplica escala maior para sessões completadas (efeito de destaque)
              index < completedSessions % sessionsUntilLongBreak
                ? "scale-110"
                : "scale-100"
            }`}
          >
            {/* 
             * Renderiza ícone baseado no status:
             * - Completada: CheckCircle2 (círculo com check) em cor primária
             * - Pendente: Circle (círculo vazio) em cor suave
             * 
             * Usa operador módulo (%) para ciclar corretamente
             * Ex: se completou 5 sessões em ciclo de 4, mostra 1 completada
             */}
            {index < completedSessions % sessionsUntilLongBreak ? (
              <CheckCircle2 className="w-5 h-5 text-pomodoro-work" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground/40" />
            )}
          </div>
        ))}
      </div>

      {/* ============== CONTADOR NUMÉRICO ============== */}
      <p className="text-sm text-muted-foreground">
        {/* Número de sessões em destaque */}
        <span className="font-semibold text-foreground">{completedSessions}</span>
        {/* Texto descritivo */}
        {" "}sessões completadas
      </p>
    </div>
  );
};

export default SessionCounter;
