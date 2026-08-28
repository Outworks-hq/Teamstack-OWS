DROP POLICY IF EXISTS "conn write" ON public.system_connections;

CREATE POLICY "conn write" ON public.system_connections
FOR ALL TO authenticated
USING (
  is_workspace_admin(workspace_id)
  OR EXISTS (
    SELECT 1 FROM public.flows f
    WHERE f.id = system_connections.flow_id
      AND f.unit_id IS NOT NULL
      AND can_manage_unit(f.unit_id)
  )
)
WITH CHECK (
  is_workspace_admin(workspace_id)
  OR EXISTS (
    SELECT 1 FROM public.flows f
    WHERE f.id = system_connections.flow_id
      AND f.unit_id IS NOT NULL
      AND can_manage_unit(f.unit_id)
  )
);