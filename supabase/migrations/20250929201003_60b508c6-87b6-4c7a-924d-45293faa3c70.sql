-- Criar constraint única para evitar check-ins duplicados
ALTER TABLE public.checkins 
ADD CONSTRAINT checkins_member_aula_unique 
UNIQUE (member_id, pacto_aula_id);