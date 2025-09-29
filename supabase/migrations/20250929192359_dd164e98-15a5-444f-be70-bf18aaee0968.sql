-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários/perfis do sistema (coordenadores, gestores)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'coordinator' CHECK (role IN ('admin', 'manager', 'coordinator')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de academias/unidades
CREATE TABLE public.gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pacto_matricula TEXT UNIQUE NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de planos
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  value DECIMAL(10,2),
  duration_months INTEGER,
  pacto_plan_id TEXT,
  gym_id UUID REFERENCES public.gyms(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela principal de membros
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pacto_member_id TEXT UNIQUE NOT NULL,
  pacto_matricula TEXT NOT NULL,
  pacto_aluno_id TEXT,
  pacto_ficha_id TEXT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  enrollment_date DATE,
  current_plan_id UUID REFERENCES public.plans(id),
  plan_value DECIMAL(10,2),
  last_checkin TIMESTAMP WITH TIME ZONE,
  days_since_last_checkin INTEGER DEFAULT 0,
  checkins_this_month INTEGER DEFAULT 0,
  average_checkins_per_month DECIMAL(5,2) DEFAULT 0,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  risk_score INTEGER DEFAULT 0,
  risk_reasons TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  avatar_url TEXT,
  gym_id UUID REFERENCES public.gyms(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de check-ins
CREATE TABLE public.checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  pacto_aula_id TEXT,
  checkin_date DATE NOT NULL,
  checkin_time TIME,
  activity TEXT,
  confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mudanças de plano
CREATE TABLE public.plan_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  old_plan_id UUID REFERENCES public.plans(id),
  new_plan_id UUID REFERENCES public.plans(id),
  change_date DATE NOT NULL,
  change_type TEXT CHECK (change_type IN ('upgrade', 'downgrade', 'change')),
  old_value DECIMAL(10,2),
  new_value DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pausas/freezes
CREATE TABLE public.pause_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  reason TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de ações geradas automaticamente
CREATE TABLE public.action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('N1', 'N2', 'N3')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
  assigned_to UUID REFERENCES public.profiles(id),
  result TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações do sistema
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de sincronização
CREATE TABLE public.sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'partial')),
  records_processed INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER
);

-- Criar índices para performance
CREATE INDEX idx_members_pacto_id ON public.members(pacto_member_id);
CREATE INDEX idx_members_risk_level ON public.members(risk_level);
CREATE INDEX idx_members_last_checkin ON public.members(last_checkin);
CREATE INDEX idx_checkins_member_date ON public.checkins(member_id, checkin_date);
CREATE INDEX idx_checkins_date ON public.checkins(checkin_date);
CREATE INDEX idx_action_items_member ON public.action_items(member_id);
CREATE INDEX idx_action_items_status ON public.action_items(status);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pause_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas RLS para dados gerais (todos usuários autenticados podem ler)
CREATE POLICY "Authenticated users can view gyms" ON public.gyms
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view plans" ON public.plans
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view members" ON public.members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view checkins" ON public.checkins
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view plan changes" ON public.plan_changes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view pause requests" ON public.pause_requests
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view action items" ON public.action_items
  FOR SELECT TO authenticated USING (true);

-- Políticas para modificação (apenas coordenadores e managers)
CREATE POLICY "Coordinators can modify action items" ON public.action_items
  FOR ALL TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('coordinator', 'manager', 'admin')
  ));

-- Políticas para configurações (apenas admins e managers)
CREATE POLICY "Managers can view settings" ON public.settings
  FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('manager', 'admin')
  ));

CREATE POLICY "Managers can modify settings" ON public.settings
  FOR ALL TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('manager', 'admin')
  ));

-- Políticas para sync logs (apenas leitura para coordenadores+)
CREATE POLICY "Coordinators can view sync logs" ON public.sync_logs
  FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('coordinator', 'manager', 'admin')
  ));

-- Função para criar perfil automaticamente ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'coordinator')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_gyms_updated_at
  BEFORE UPDATE ON public.gyms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_action_items_updated_at
  BEFORE UPDATE ON public.action_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Inserir configurações padrão para o motor de risco
INSERT INTO public.settings (key, value, description, category) VALUES
('risk_thresholds', '{"low": 25, "medium": 60, "high": 90}', 'Limites de score para classificação de risco', 'risk_engine'),
('risk_weights', '{"days_without_checkin": 30, "checkin_frequency_drop": 25, "plan_downgrade": 20, "pause_request": 15, "payment_issues": 10}', 'Pesos para cálculo do score de risco', 'risk_engine'),
('auto_actions', '{"N1_threshold": 40, "N2_threshold": 65, "N3_threshold": 85}', 'Thresholds para geração automática de ações', 'actions'),
('sync_frequency', '{"members": "daily", "checkins": "hourly", "plans": "daily"}', 'Frequência de sincronização com Pacto API', 'sync');

-- Inserir uma academia padrão
INSERT INTO public.gyms (name, pacto_matricula, address, phone, email) 
VALUES ('Academia Principal', 'MAT001', 'Endereço da Academia', '(11) 99999-9999', 'contato@academia.com');