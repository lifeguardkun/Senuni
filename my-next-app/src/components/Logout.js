'use client';

import { logoutAction } from '@/actions/auth-actions';

export default function Logout() {
  return (
    <form action={logoutAction}>
      <button 
        type="submit" 
        className="text-sm text-gray-500 hover:text-red-600 underline"
      >
        Sign Out
      </button>
    </form>
  );
}