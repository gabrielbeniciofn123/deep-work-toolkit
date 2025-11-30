/**
 * ============================================================
 * PÁGINA DE RELATÓRIO SEMANAL
 * ============================================================
 * Esta página exibe estatísticas e relatórios das sessões de
 * estudo do usuário. Mostra gráficos de progresso semanal,
 * permite definir metas e oferece sugestões inteligentes
 * baseadas no histórico de estudos.
 * ============================================================
 */

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { 
  Clock, 
  ArrowLeft, 
  Target, 
  TrendingUp, 
  Calendar,
  BookOpen,
  Edit2,
  Check,
  X
} from "lucide-react";

/**
 * Nomes dos dias da semana em português
 */
const DAYS_OF_WEEK = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

/**
 * Abreviações dos dias da semana
 */
const DAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/**
 * Interface para representar uma meta semanal
 */
interface WeeklyGoal {
  id?: string;
  day_of_week: number;
  target_pomodoros: number;
  subject: string | null;
}

/**
 * Interface para representar dados de estudo de um dia
 */
interface DayData {
  dayOfWeek: number;
  completed: number;
  target: number;
  subject: string | null;
}

/**
 * Componente principal da página de relatório semanal
 */
const WeeklyReport = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Estado dos dados semanais
  const [weekData, setWeekData] = useState<DayData[]>([]);
  // Estado das metas
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  // Estado de loading
  const [loading, setLoading] = useState(true);
  // Dia sendo editado
  const [editingDay, setEditingDay] = useState<number | null>(null);
  // Valores temporários para edição
  const [editTarget, setEditTarget] = useState(4);
  const [editSubject, setEditSubject] = useState("");

  /**
   * Redireciona para login se não estiver autenticado
   */
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  /**
   * Carrega os dados quando o usuário está disponível
   */
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  /**
   * Carrega as sessões de estudo e metas do banco de dados
   */
  const loadData = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Calcula o início e fim da semana atual
      const today = new Date();
      const dayOfWeek = today.getDay();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      // Busca as sessões de estudo da semana
      const { data: sessions, error: sessionsError } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("mode", "pomodoro")
        .gte("completed_at", startOfWeek.toISOString())
        .lt("completed_at", endOfWeek.toISOString());

      if (sessionsError) throw sessionsError;

      // Busca as metas semanais do usuário
      const { data: goalsData, error: goalsError } = await supabase
        .from("weekly_goals")
        .select("*")
        .eq("user_id", user.id);

      if (goalsError) throw goalsError;

      // Processa os dados e organiza por dia da semana
      const processedGoals: WeeklyGoal[] = goalsData || [];
      setGoals(processedGoals);

      // Cria o array com dados de cada dia
      const data: DayData[] = [];
      for (let i = 0; i < 7; i++) {
        // Conta pomodoros completados neste dia
        const completed = sessions?.filter((s) => s.day_of_week === i).length || 0;
        // Encontra a meta para este dia
        const goal = processedGoals.find((g) => g.day_of_week === i);

        data.push({
          dayOfWeek: i,
          completed,
          target: goal?.target_pomodoros || 4,
          subject: goal?.subject || null,
        });
      }

      setWeekData(data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Inicia a edição de um dia específico
   * @param day - Número do dia da semana (0-6)
   */
  const startEditing = (day: number) => {
    const dayData = weekData.find((d) => d.dayOfWeek === day);
    setEditTarget(dayData?.target || 4);
    setEditSubject(dayData?.subject || "");
    setEditingDay(day);
  };

  /**
   * Cancela a edição atual
   */
  const cancelEditing = () => {
    setEditingDay(null);
    setEditTarget(4);
    setEditSubject("");
  };

  /**
   * Salva a meta editada no banco de dados
   */
  const saveGoal = async () => {
    if (!user || editingDay === null) return;

    try {
      // Verifica se já existe uma meta para este dia
      const existingGoal = goals.find((g) => g.day_of_week === editingDay);

      if (existingGoal?.id) {
        // Atualiza meta existente
        const { error } = await supabase
          .from("weekly_goals")
          .update({
            target_pomodoros: editTarget,
            subject: editSubject || null,
          })
          .eq("id", existingGoal.id);

        if (error) throw error;
      } else {
        // Cria nova meta
        const { error } = await supabase.from("weekly_goals").insert({
          user_id: user.id,
          day_of_week: editingDay,
          target_pomodoros: editTarget,
          subject: editSubject || null,
        });

        if (error) throw error;
      }

      toast({
        title: "Meta salva!",
        description: `Meta para ${DAYS_OF_WEEK[editingDay]} atualizada`,
      });

      // Recarrega os dados
      loadData();
      cancelEditing();
    } catch (error) {
      console.error("Erro ao salvar meta:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a meta",
        variant: "destructive",
      });
    }
  };

  /**
   * Calcula estatísticas gerais da semana
   */
  const calculateStats = () => {
    const totalCompleted = weekData.reduce((sum, d) => sum + d.completed, 0);
    const totalTarget = weekData.reduce((sum, d) => sum + d.target, 0);
    const percentage = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0;
    const totalMinutes = totalCompleted * 25;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return { totalCompleted, totalTarget, percentage, hours, minutes };
  };

  /**
   * Gera sugestões inteligentes baseadas no progresso
   */
  const generateSuggestions = () => {
    const stats = calculateStats();
    const suggestions: string[] = [];
    const today = new Date().getDay();
    const todayData = weekData.find((d) => d.dayOfWeek === today);

    // Verifica se está abaixo da meta hoje
    if (todayData && todayData.completed < todayData.target) {
      const remaining = todayData.target - todayData.completed;
      suggestions.push(
        `Você ainda tem ${remaining} pomodoro${remaining > 1 ? "s" : ""} para completar hoje. Vamos lá!`
      );
    }

    // Verifica progresso geral da semana
    if (stats.percentage < 50) {
      suggestions.push(
        "Sua semana está abaixo de 50%. Tente focar mais nos próximos dias!"
      );
    } else if (stats.percentage >= 80) {
      suggestions.push(
        "Excelente progresso! Você está mandando muito bem esta semana! 🎉"
      );
    }

    // Identifica dias com baixo desempenho
    const lowDays = weekData.filter(
      (d) => d.target > 0 && d.completed < d.target * 0.5 && d.dayOfWeek < today
    );
    if (lowDays.length > 0) {
      suggestions.push(
        `Você ficou abaixo da meta em ${lowDays.length} dia${lowDays.length > 1 ? "s" : ""}. Considere ajustar suas metas para serem mais realistas.`
      );
    }

    // Sugestão de consistência
    const consecutiveCompleted = weekData.filter(
      (d) => d.dayOfWeek <= today && d.completed >= d.target
    ).length;
    if (consecutiveCompleted >= 3) {
      suggestions.push(
        "Você está mantendo uma ótima consistência! Continue assim!"
      );
    }

    return suggestions.length > 0
      ? suggestions
      : ["Configure suas metas semanais para receber sugestões personalizadas!"];
  };

  // Loading enquanto verifica autenticação
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const stats = calculateStats();
  const suggestions = generateSuggestions();
  const today = new Date().getDay();

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full px-6 py-4 border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Logo e navegação */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg text-foreground">
                Relatório Semanal
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 fade-in">
          {/* Total de pomodoros */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Pomodoros Completados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats.totalCompleted}
                <span className="text-lg text-muted-foreground font-normal">
                  /{stats.totalTarget}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Tempo de estudo */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Tempo de Estudo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats.hours}h {stats.minutes}m
              </div>
            </CardContent>
          </Card>

          {/* Progresso */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Progresso da Semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-2">
                {stats.percentage}%
              </div>
              <Progress value={stats.percentage} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Gráfico semanal */}
        <Card className="fade-in" style={{ animationDelay: "0.1s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Visão Semanal
            </CardTitle>
            <CardDescription>
              Clique no ícone de edição para configurar suas metas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weekData.map((day) => (
                <div key={day.dayOfWeek} className="space-y-2">
                  {/* Linha de edição (visível quando editando) */}
                  {editingDay === day.dayOfWeek ? (
                    <div className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
                      <span className="font-medium w-16">{DAYS_SHORT[day.dayOfWeek]}</span>
                      <div className="flex-1 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Meta:</Label>
                          <Input
                            type="number"
                            min={1}
                            max={20}
                            value={editTarget}
                            onChange={(e) => setEditTarget(Number(e.target.value))}
                            className="w-20"
                          />
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <Label className="text-sm">Matéria:</Label>
                          <Input
                            type="text"
                            placeholder="Ex: Matemática"
                            value={editSubject}
                            onChange={(e) => setEditSubject(e.target.value)}
                            className="max-w-40"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" onClick={saveGoal}>
                            <Check className="w-4 h-4 text-accent" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={cancelEditing}>
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Linha normal de visualização
                    <div className="flex items-center gap-4">
                      <span
                        className={`font-medium w-16 ${
                          day.dayOfWeek === today ? "text-primary" : ""
                        }`}
                      >
                        {DAYS_SHORT[day.dayOfWeek]}
                        {day.dayOfWeek === today && " •"}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">
                            {day.completed}/{day.target} pomodoros
                            {day.subject && ` • ${day.subject}`}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => startEditing(day.dayOfWeek)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <Progress
                          value={(day.completed / day.target) * 100}
                          className="h-3"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sugestões inteligentes */}
        <Card className="fade-in" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Sugestões Inteligentes
            </CardTitle>
            <CardDescription>
              Dicas personalizadas baseadas no seu progresso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg"
                >
                  <span className="text-primary">💡</span>
                  <span className="text-sm">{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default WeeklyReport;
