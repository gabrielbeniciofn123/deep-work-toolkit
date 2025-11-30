-- Tabela de perfis de usuários
-- Armazena informações adicionais do usuário além do auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilita RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Política: usuários podem criar seu próprio perfil
CREATE POLICY "Users can create own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política: usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Tabela de sessões de estudo (pomodoros completados)
-- Registra cada sessão de pomodoro finalizada pelo usuário
CREATE TABLE public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('pomodoro', 'shortBreak', 'longBreak')),
  duration_minutes INTEGER NOT NULL,
  task_name TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6)
);

-- Habilita RLS na tabela study_sessions
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver suas próprias sessões
CREATE POLICY "Users can view own sessions" ON public.study_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Política: usuários podem criar suas próprias sessões
CREATE POLICY "Users can create own sessions" ON public.study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política: usuários podem deletar suas próprias sessões
CREATE POLICY "Users can delete own sessions" ON public.study_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Tabela de metas semanais de estudo
-- Armazena as metas de estudo para cada dia da semana
CREATE TABLE public.weekly_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  target_pomodoros INTEGER NOT NULL DEFAULT 4,
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, day_of_week)
);

-- Habilita RLS na tabela weekly_goals
ALTER TABLE public.weekly_goals ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver suas próprias metas
CREATE POLICY "Users can view own goals" ON public.weekly_goals
  FOR SELECT USING (auth.uid() = user_id);

-- Política: usuários podem criar suas próprias metas
CREATE POLICY "Users can create own goals" ON public.weekly_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política: usuários podem atualizar suas próprias metas
CREATE POLICY "Users can update own goals" ON public.weekly_goals
  FOR UPDATE USING (auth.uid() = user_id);

-- Política: usuários podem deletar suas próprias metas
CREATE POLICY "Users can delete own goals" ON public.weekly_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'name');
  RETURN NEW;
END;
$$;

-- Trigger que executa a função quando novo usuário é criado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar timestamp de updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weekly_goals_updated_at
  BEFORE UPDATE ON public.weekly_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();