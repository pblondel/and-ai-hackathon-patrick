import Link from 'next/link';
import { signupWithPassword } from '../actions';

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main style={{ maxWidth: 400, margin: '4rem auto', padding: '0 1rem' }}>
      <h1>Create an account</h1>

      {error && (
        <p role="alert" style={{ color: 'crimson' }}>
          {error}
        </p>
      )}

      <form action={signupWithPassword} style={{ marginTop: '1.5rem' }}>
        <label>
          Full name
          <input
            type="text"
            name="full_name"
            autoComplete="name"
            style={{ display: 'block', width: '100%' }}
          />
        </label>
        <label style={{ display: 'block', marginTop: '0.5rem' }}>
          Email
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            style={{ display: 'block', width: '100%' }}
          />
        </label>
        <label style={{ display: 'block', marginTop: '0.5rem' }}>
          Password
          <input
            type="password"
            name="password"
            required
            minLength={6}
            autoComplete="new-password"
            style={{ display: 'block', width: '100%' }}
          />
        </label>
        <button type="submit" style={{ marginTop: '1rem' }}>
          Create account
        </button>
      </form>

      <p style={{ marginTop: '2rem', fontSize: '0.875rem' }}>
        Already have an account? <Link href="/auth/login">Sign in</Link>
      </p>
    </main>
  );
}