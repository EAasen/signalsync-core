'use client';

import { useState } from 'react';
import { createOrganization } from '@/lib/actions/organizations';

export default function OnboardingPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [orgName, setOrgName] = useState('');

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setOrgName(name);
    // Auto-update slug field
    const slugInput = document.getElementById('orgSlug') as HTMLInputElement;
    if (slugInput) {
      slugInput.value = generateSlug(name);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createOrganization(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // If successful, redirect happens in the action
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-lg bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to SignalSync!</h1>
        <p className="mt-2 text-gray-600">
          Let's set up your organization to get started with monitoring.
        </p>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="orgName" className="block text-sm font-medium text-gray-700">
                Organization Name
              </label>
              <input
                type="text"
                id="orgName"
                name="orgName"
                required
                value={orgName}
                onChange={handleNameChange}
                placeholder="Acme Inc"
                disabled={loading}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
              />
              <p className="mt-1 text-sm text-gray-500">
                This will be displayed on your status page
              </p>
            </div>

            <div>
              <label htmlFor="orgSlug" className="block text-sm font-medium text-gray-700">
                Organization Slug
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                  /status/
                </span>
                <input
                  type="text"
                  id="orgSlug"
                  name="orgSlug"
                  required
                  placeholder="acme-inc"
                  pattern="[a-z0-9-]+"
                  disabled={loading}
                  className="block w-full rounded-none rounded-r-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Lowercase letters, numbers, and hyphens only
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Organization'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
