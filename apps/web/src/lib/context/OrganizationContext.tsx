'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Organization } from '@signalsync/types';
import { getUserOrganizations } from '@/lib/actions/organizations';

interface OrganizationContextType {
  organizations: Organization[];
  currentOrganization: Organization | null;
  setCurrentOrganization: (org: Organization) => void;
  loading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ 
  children,
  userId,
}: { 
  children: React.ReactNode;
  userId: string;
}) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrganizations() {
      setLoading(true);
      const orgs = await getUserOrganizations(userId);
      setOrganizations(orgs);

      // Try to restore from localStorage
      const savedOrgId = localStorage.getItem('currentOrganizationId');
      const savedOrg = orgs.find((o: Organization) => o.id === savedOrgId);

      // Set current org (from storage or first available)
      if (savedOrg) {
        setCurrentOrganization(savedOrg);
      } else if (orgs.length > 0) {
        setCurrentOrganization(orgs[0]);
      }

      setLoading(false);
    }

    loadOrganizations();
  }, [userId]);

  const handleSetCurrentOrganization = (org: Organization) => {
    setCurrentOrganization(org);
    localStorage.setItem('currentOrganizationId', org.id);
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        currentOrganization,
        setCurrentOrganization: handleSetCurrentOrganization,
        loading,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
