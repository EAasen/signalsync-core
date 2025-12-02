'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function createOrganization(formData: FormData) {
  const supabase = await createClient();
  
  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const name = formData.get('orgName') as string;
  const slug = formData.get('orgSlug') as string;

  // Validate inputs
  if (!name || !slug) {
    return { error: 'Organization name and slug are required' };
  }

  // Validate slug format (lowercase, alphanumeric, hyphens)
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(slug)) {
    return { error: 'Slug must contain only lowercase letters, numbers, and hyphens' };
  }

  // Check if slug is already taken
  const { data: existingOrg } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .single();

  if (existingOrg) {
    return { error: 'This slug is already taken. Please choose another.' };
  }

  // Create organization
  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name,
      slug,
    })
    .select()
    .single();

  if (orgError) {
    console.error('Error creating organization:', orgError);
    return { error: 'Failed to create organization' };
  }

  // Add user as owner in team_members
  const { error: teamError } = await supabase
    .from('team_members')
    .insert({
      organization_id: organization.id,
      user_id: user.id,
      role: 'owner',
      joined_at: new Date().toISOString(),
    });

  if (teamError) {
    console.error('Error adding team member:', teamError);
    // Rollback: delete organization
    await supabase.from('organizations').delete().eq('id', organization.id);
    return { error: 'Failed to set up organization ownership' };
  }

  // Create a default project
  const { error: projectError } = await supabase
    .from('projects')
    .insert({
      organization_id: organization.id,
      name: 'Default',
      slug: 'default',
    });

  if (projectError) {
    console.error('Error creating default project:', projectError);
    // Non-fatal, continue anyway
  }

  revalidatePath('/dashboard', 'layout');
  redirect('/dashboard');
}

export async function getUserOrganizations(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('team_members')
    .select('organization_id, role, organizations(*)')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user organizations:', error);
    return [];
  }

  return data.map((tm) => ({
    ...tm.organizations,
    role: tm.role,
  }));
}

export async function getOrganizationProjects(organizationId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  return data;
}

export async function createProject(organizationId: string, name: string, slug: string) {
  const supabase = await createClient();

  // Validate user has access to this organization
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { data: teamMember } = await supabase
    .from('team_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single();

  if (!teamMember || (teamMember.role !== 'owner' && teamMember.role !== 'admin')) {
    return { error: 'Insufficient permissions' };
  }

  // Check if slug is already taken in this organization
  const { data: existingProject } = await supabase
    .from('projects')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('slug', slug)
    .single();

  if (existingProject) {
    return { error: 'Project slug already exists in this organization' };
  }

  // Create project
  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      organization_id: organizationId,
      name,
      slug,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error);
    return { error: 'Failed to create project' };
  }

  revalidatePath('/dashboard');
  return { success: true, project };
}
