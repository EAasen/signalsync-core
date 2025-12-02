import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { OrganizationProvider } from '@/lib/context/OrganizationContext';
import { getUserOrganizations } from '@/lib/actions/organizations';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user has any organizations
  const organizations = await getUserOrganizations(user.id);
  
  // If no organizations and not on onboarding page, redirect to onboarding
  if (organizations.length === 0 && !globalThis.location?.pathname.includes('/onboarding')) {
    // Note: This check happens server-side, so pathname isn't available
    // We'll handle this in the client-side navigation instead
  }

  return (
    <OrganizationProvider userId={user.id}>
      <div className="min-h-screen bg-gray-50">
        <DashboardNav user={user} />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </OrganizationProvider>
  );
}
