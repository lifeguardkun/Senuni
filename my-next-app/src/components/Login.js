'use client';

import { loginAction } from '../actions/auth-actions';

export default function Login() {
  return (
    <div>
      <h1>Login</h1>
      <form action={loginAction}>
        < button type="submit"
          className="px-4 py-1 text-gray-600 bg-white border border-gray-800 rounded hover:bg-gray-100"
        >
          Sign in with Google
        </button>
      </form>
    </div>
  );
}