-- Create custom types
CREATE TYPE project_role AS ENUM ('admin', 'member');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'completed');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create project members table
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role project_role DEFAULT 'member',
  UNIQUE(project_id, user_id)
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'todo',
  priority task_priority DEFAULT 'medium',
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS)

-- Shared authorization helpers
CREATE OR REPLACE FUNCTION public.is_global_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND is_admin = TRUE
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.can_access_project(project_uuid UUID)
RETURNS boolean AS $$
  SELECT public.is_global_admin()
    OR EXISTS (
      SELECT 1
      FROM public.project_members
      WHERE project_id = project_uuid
        AND user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.projects
      WHERE id = project_uuid
        AND owner_id = auth.uid()
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.can_manage_project(project_uuid UUID)
RETURNS boolean AS $$
  SELECT public.is_global_admin()
    OR EXISTS (
      SELECT 1
      FROM public.projects
      WHERE id = project_uuid
        AND owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.project_members
      WHERE project_id = project_uuid
        AND user_id = auth.uid()
        AND role = 'admin'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Profiles: Users can read all profiles, but only update their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Global admins can update profiles" ON profiles FOR UPDATE USING (public.is_global_admin());

-- Projects: Users can see projects they are members of
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view projects they belong to" ON projects FOR SELECT 
  USING (public.can_access_project(id));
CREATE POLICY "Owners can update/delete projects" ON projects FOR ALL 
  USING (public.can_manage_project(id));
CREATE POLICY "Authenticated users can create projects" ON projects FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Project Members: Members can see other members of the same project
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Project members can view fellow members" ON project_members FOR SELECT 
  USING (public.can_access_project(project_id));
CREATE POLICY "Project admins can manage members" ON project_members FOR ALL 
  USING (public.can_manage_project(project_id))
  WITH CHECK (public.can_manage_project(project_id));

-- Tasks: Project members can see and manage tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Project members can view tasks" ON tasks FOR SELECT 
  USING (public.can_access_project(project_id));
CREATE POLICY "Project admins can create tasks" ON tasks FOR INSERT 
  WITH CHECK (public.can_manage_project(project_id));
CREATE POLICY "Project admins or task owners can update tasks" ON tasks FOR UPDATE 
  USING (public.can_manage_project(project_id) OR assigned_to = auth.uid())
  WITH CHECK (public.can_manage_project(project_id) OR assigned_to = auth.uid());
CREATE POLICY "Project admins can delete tasks" ON tasks FOR DELETE 
  USING (public.can_manage_project(project_id));

CREATE OR REPLACE FUNCTION public.enforce_task_update_permissions()
RETURNS trigger AS $$
BEGIN
  IF public.can_manage_project(OLD.project_id) THEN
    RETURN NEW;
  END IF;

  IF OLD.assigned_to IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF NEW.project_id IS DISTINCT FROM OLD.project_id
    OR NEW.title IS DISTINCT FROM OLD.title
    OR NEW.description IS DISTINCT FROM OLD.description
    OR NEW.priority IS DISTINCT FROM OLD.priority
    OR NEW.assigned_to IS DISTINCT FROM OLD.assigned_to
    OR NEW.due_date IS DISTINCT FROM OLD.due_date THEN
    RAISE EXCEPTION 'Members can only update the status of their own tasks.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER guard_task_updates
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE PROCEDURE public.enforce_task_update_permissions();

-- Functions and Triggers
-- Automatically create profile on signup
CREATE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
