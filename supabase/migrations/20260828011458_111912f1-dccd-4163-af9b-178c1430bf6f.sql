
REVOKE ALL ON FUNCTION public.is_workspace_member(uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.is_workspace_admin(uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.is_unit_admin(uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.can_manage_unit(uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.accept_my_invitations() FROM public, anon;
REVOKE ALL ON FUNCTION public.create_workspace(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_workspace_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_workspace_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_unit_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_unit(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_my_invitations() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_workspace(text) TO authenticated;
