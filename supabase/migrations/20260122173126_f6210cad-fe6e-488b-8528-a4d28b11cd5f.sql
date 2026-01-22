INSERT INTO public.user_roles (user_id, role)
VALUES ('c9c86331-a6b9-4e65-8b88-ffb2e8dc2881', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;