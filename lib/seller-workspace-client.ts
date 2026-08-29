import { auth } from '@/lib/firebase';

export async function sellerWorkspaceRequest(path = '', init?: RequestInit) {
  const user = auth.currentUser;
  if (!user) throw new Error('Your seller session has expired. Please sign in again.');
  const token = await user.getIdToken();
  const response = await fetch(`/api/seller/workspace${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(init?.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'The seller workspace request failed.');
  return data;
}
