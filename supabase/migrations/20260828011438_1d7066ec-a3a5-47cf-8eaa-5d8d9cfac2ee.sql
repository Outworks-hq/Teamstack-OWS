
-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  billing_mode text NOT NULL DEFAULT 'central',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspaces TO authenticated;
GRANT ALL ON public.workspaces TO service_role;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'viewer',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_members TO authenticated;
GRANT ALL ON public.workspace_members TO service_role;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  name text NOT NULL,
  purpose text,
  status text NOT NULL DEFAULT 'open',
  enabled_functions text[] NOT NULL DEFAULT ARRAY['console','control_room','systems','notifications','connected_operations','billing'],
  billing_mode text NOT NULL DEFAULT 'central',
  payer_user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.units TO authenticated;
GRANT ALL ON public.units TO service_role;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.unit_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.units ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'viewer',
  permissions text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (unit_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.unit_members TO authenticated;
GRANT ALL ON public.unit_members TO service_role;
ALTER TABLE public.unit_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.systems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  unit_id uuid REFERENCES public.units ON DELETE SET NULL,
  provider text NOT NULL DEFAULT 'custom',
  name text NOT NULL,
  category text,
  external_url text,
  notes text,
  status text NOT NULL DEFAULT 'unknown',
  integration_status text NOT NULL DEFAULT 'manual',
  capabilities text[] NOT NULL DEFAULT '{}',
  config jsonb NOT NULL DEFAULT '{}',
  responsible_user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.systems TO authenticated;
GRANT ALL ON public.systems TO service_role;
ALTER TABLE public.systems ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.flows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  unit_id uuid REFERENCES public.units ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flows TO authenticated;
GRANT ALL ON public.flows TO service_role;
ALTER TABLE public.flows ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.system_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  flow_id uuid NOT NULL REFERENCES public.flows ON DELETE CASCADE,
  from_system_id uuid NOT NULL REFERENCES public.systems ON DELETE CASCADE,
  to_system_id uuid NOT NULL REFERENCES public.systems ON DELETE CASCADE,
  label text,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_connections TO authenticated;
GRANT ALL ON public.system_connections TO service_role;
ALTER TABLE public.system_connections ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  unit_id uuid REFERENCES public.units ON DELETE SET NULL,
  system_id uuid REFERENCES public.systems ON DELETE SET NULL,
  severity text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  body text,
  source text NOT NULL DEFAULT 'internal',
  external_ref text,
  payload jsonb NOT NULL DEFAULT '{}',
  resolved_at timestamptz,
  created_by uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  unit_id uuid REFERENCES public.units ON DELETE SET NULL,
  system_id uuid REFERENCES public.systems ON DELETE SET NULL,
  actor_id uuid REFERENCES auth.users ON DELETE SET NULL,
  action text NOT NULL,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_events TO authenticated;
GRANT ALL ON public.activity_events TO service_role;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  unit_id uuid REFERENCES public.units ON DELETE CASCADE,
  email text NOT NULL,
  workspace_role text NOT NULL DEFAULT 'viewer',
  unit_role text NOT NULL DEFAULT 'viewer',
  status text NOT NULL DEFAULT 'pending',
  invited_by uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitations TO authenticated;
GRANT ALL ON public.invitations TO service_role;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.billing_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  unit_id uuid REFERENCES public.units ON DELETE CASCADE,
  period_start date NOT NULL DEFAULT (date_trunc('month', now())::date),
  amount_cents bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  payer_user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.billing_records TO authenticated;
GRANT ALL ON public.billing_records TO service_role;
ALTER TABLE public.billing_records ENABLE ROW LEVEL SECURITY;

-- helper functions
CREATE OR REPLACE FUNCTION public.is_workspace_member(_workspace_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.workspace_members m WHERE m.workspace_id = _workspace_id AND m.user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_admin(_workspace_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members m
    WHERE m.workspace_id = _workspace_id AND m.user_id = auth.uid() AND m.role IN ('owner','admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_unit_admin(_unit_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.unit_members um
    WHERE um.unit_id = _unit_id AND um.user_id = auth.uid() AND um.role = 'unit_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_unit(_unit_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_unit_admin(_unit_id)
     OR EXISTS (SELECT 1 FROM public.units u WHERE u.id = _unit_id AND public.is_workspace_admin(u.workspace_id));
$$;

-- policies
CREATE POLICY "profiles readable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE POLICY "workspaces select" ON public.workspaces FOR SELECT TO authenticated USING (owner_id = auth.uid() OR public.is_workspace_member(id));
CREATE POLICY "workspaces insert" ON public.workspaces FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "workspaces update" ON public.workspaces FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.is_workspace_admin(id));
CREATE POLICY "workspaces delete" ON public.workspaces FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "wm select" ON public.workspace_members FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_workspace_member(workspace_id));
CREATE POLICY "wm insert" ON public.workspace_members FOR INSERT TO authenticated WITH CHECK (
  public.is_workspace_admin(workspace_id)
  OR EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid())
);
CREATE POLICY "wm update" ON public.workspace_members FOR UPDATE TO authenticated USING (public.is_workspace_admin(workspace_id));
CREATE POLICY "wm delete" ON public.workspace_members FOR DELETE TO authenticated USING (public.is_workspace_admin(workspace_id));

CREATE POLICY "units select" ON public.units FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "units insert" ON public.units FOR INSERT TO authenticated WITH CHECK (public.is_workspace_admin(workspace_id));
CREATE POLICY "units update" ON public.units FOR UPDATE TO authenticated USING (public.is_workspace_admin(workspace_id) OR public.is_unit_admin(id));
CREATE POLICY "units delete" ON public.units FOR DELETE TO authenticated USING (public.is_workspace_admin(workspace_id));

CREATE POLICY "um select" ON public.unit_members FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "um insert" ON public.unit_members FOR INSERT TO authenticated WITH CHECK (public.can_manage_unit(unit_id));
CREATE POLICY "um update" ON public.unit_members FOR UPDATE TO authenticated USING (public.can_manage_unit(unit_id));
CREATE POLICY "um delete" ON public.unit_members FOR DELETE TO authenticated USING (public.can_manage_unit(unit_id));

CREATE POLICY "systems select" ON public.systems FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "systems insert" ON public.systems FOR INSERT TO authenticated WITH CHECK (public.is_workspace_admin(workspace_id) OR (unit_id IS NOT NULL AND public.can_manage_unit(unit_id)));
CREATE POLICY "systems update" ON public.systems FOR UPDATE TO authenticated USING (public.is_workspace_admin(workspace_id) OR (unit_id IS NOT NULL AND public.can_manage_unit(unit_id)));
CREATE POLICY "systems delete" ON public.systems FOR DELETE TO authenticated USING (public.is_workspace_admin(workspace_id) OR (unit_id IS NOT NULL AND public.can_manage_unit(unit_id)));

CREATE POLICY "flows select" ON public.flows FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "flows write" ON public.flows FOR ALL TO authenticated USING (public.is_workspace_admin(workspace_id) OR (unit_id IS NOT NULL AND public.can_manage_unit(unit_id))) WITH CHECK (public.is_workspace_admin(workspace_id) OR (unit_id IS NOT NULL AND public.can_manage_unit(unit_id)));

CREATE POLICY "conn select" ON public.system_connections FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "conn write" ON public.system_connections FOR ALL TO authenticated USING (public.is_workspace_admin(workspace_id)) WITH CHECK (public.is_workspace_admin(workspace_id));

CREATE POLICY "notif select" ON public.notifications FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "notif insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id));
CREATE POLICY "notif update" ON public.notifications FOR UPDATE TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "notif delete" ON public.notifications FOR DELETE TO authenticated USING (public.is_workspace_admin(workspace_id));

CREATE POLICY "activity select" ON public.activity_events FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "activity insert" ON public.activity_events FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "inv select" ON public.invitations FOR SELECT TO authenticated USING (
  public.is_workspace_member(workspace_id) OR lower(email) = lower(coalesce(auth.jwt() ->> 'email',''))
);
CREATE POLICY "inv insert" ON public.invitations FOR INSERT TO authenticated WITH CHECK (public.is_workspace_admin(workspace_id) OR (unit_id IS NOT NULL AND public.can_manage_unit(unit_id)));
CREATE POLICY "inv update" ON public.invitations FOR UPDATE TO authenticated USING (
  public.is_workspace_admin(workspace_id) OR lower(email) = lower(coalesce(auth.jwt() ->> 'email',''))
);
CREATE POLICY "inv delete" ON public.invitations FOR DELETE TO authenticated USING (public.is_workspace_admin(workspace_id));

CREATE POLICY "billing select" ON public.billing_records FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "billing write" ON public.billing_records FOR ALL TO authenticated USING (public.is_workspace_admin(workspace_id)) WITH CHECK (public.is_workspace_admin(workspace_id));

-- accept invitations for the current user
CREATE OR REPLACE FUNCTION public.accept_my_invitations()
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _email text := lower(coalesce(auth.jwt() ->> 'email',''));
  _uid uuid := auth.uid();
  _count int := 0;
  r record;
BEGIN
  IF _uid IS NULL OR _email = '' THEN RETURN 0; END IF;
  FOR r IN SELECT * FROM public.invitations WHERE status = 'pending' AND lower(email) = _email LOOP
    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (r.workspace_id, _uid, r.workspace_role)
    ON CONFLICT (workspace_id, user_id) DO NOTHING;
    IF r.unit_id IS NOT NULL THEN
      INSERT INTO public.unit_members (unit_id, workspace_id, user_id, role)
      VALUES (r.unit_id, r.workspace_id, _uid, r.unit_role)
      ON CONFLICT (unit_id, user_id) DO NOTHING;
    END IF;
    UPDATE public.invitations SET status = 'accepted' WHERE id = r.id;
    _count := _count + 1;
  END LOOP;
  RETURN _count;
END;
$$;
GRANT EXECUTE ON FUNCTION public.accept_my_invitations() TO authenticated;

-- create workspace with owner membership in one call
CREATE OR REPLACE FUNCTION public.create_workspace(_name text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid; _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  INSERT INTO public.workspaces (name, owner_id) VALUES (_name, _uid) RETURNING id INTO _id;
  INSERT INTO public.workspace_members (workspace_id, user_id, role) VALUES (_id, _uid, 'owner');
  RETURN _id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_workspace(text) TO authenticated;
