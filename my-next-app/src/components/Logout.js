'use client';

import { logoutAction } from '@/actions/auth-actions';

export default function Logout() {
  return (
    <form action={logoutAction}>
      <button 
        type="submit" 
        className="px-4 py-1 text-gray-600 bg-white border border-gray-800 rounded hover:bg-gray-100"
      >
        Sign Out
      </button>
    </form>
  );
}