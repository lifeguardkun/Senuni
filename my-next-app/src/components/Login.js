'use client';

import { loginAction } from '../actions/auth-actions';

export default function Login() {
  return (
    <div>
      <h1>Login</h1>
      <form action={loginAction}>
        <button type="submit">Sign in with Google</button>
      </form>
    </div>
  );
}