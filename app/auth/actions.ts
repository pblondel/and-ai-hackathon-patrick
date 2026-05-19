'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';

// Resolve the site URL for redirects.
// Priority: explicit env var → request origin → localhost fallback.
// In production NEXT_PUBLIC_SITE_URL should always be set.
async function getOrigin() {
  if (env.siteUrl) return env.siteUrl;
  const h = await headers();
  return h.get('origin') ?? 'http://localhost:3000';
}

function sanitizeNext(next: string): string {
  if (!next) return '/';
  if (!next.startsWith('/') || next.startsWith('//')) return '/';
  if (next.includes(':')) return '/';
  return next;
}

// -----------------------------------------------------------------------------
// Email + password login
// -----------------------------------------------------------------------------

export async function loginWithPassword(formData: FormData) {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const next = sanitizeNext(String(formData.get('next') ?? ''));

  if (!email || !password) {
    redirect('/auth/login?error=' + encodeURIComponent('Email and password are required'));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect('/auth/login?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/', 'layout');
  redirect(next);
}

// -----------------------------------------------------------------------------
// Email + password signup
// -----------------------------------------------------------------------------

export async function signupWithPassword(formData: FormData) {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const fullName = String(formData.get('full_name') ?? '');

  if (!email || !password) {
    redirect('/auth/signup?error=' + encodeURIComponent('Email and password are required'));
  }

  const supabase = await createClient();
  const origin = await getOrigin();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: { full_name: fullName },
    },
  });

  if (error) {
    redirect('/auth/signup?error=' + encodeURIComponent(error.message));
  }

  // Supabase has sent a confirmation email. The user needs to click the
  // link before they can sign in. Send them to a landing page that says so.
  redirect('/auth/check-email');
}

// -----------------------------------------------------------------------------
// Magic link (passwordless email)
// -----------------------------------------------------------------------------

export async function loginWithMagicLink(formData: FormData) {
  const email = String(formData.get('email') ?? '');
  const next = sanitizeNext(String(formData.get('next') ?? ''));

  if (!email) {
    redirect('/auth/login?error=' + encodeURIComponent('Email is required'));
  }

  const supabase = await createClient();
  const origin = await getOrigin();

  const callbackUrl = new URL('/auth/callback', origin);
  callbackUrl.searchParams.set('next', next);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl.toString(),
      // shouldCreateUser: false  // uncomment to disallow signups via magic link
    },
  });

  if (error) {
    redirect('/auth/login?error=' + encodeURIComponent(error.message));
  }

  redirect('/auth/check-email');
}

// -----------------------------------------------------------------------------
// OAuth (Google, GitHub)
// -----------------------------------------------------------------------------

export async function loginWithOAuth(formData: FormData) {
  const provider = String(formData.get('provider') ?? '') as 'google' | 'github';
  const next = sanitizeNext(String(formData.get('next') ?? ''));

  if (provider !== 'google' && provider !== 'github') {
    redirect('/auth/login?error=' + encodeURIComponent('Unknown OAuth provider'));
  }

  const supabase = await createClient();
  const origin = await getOrigin();

  const callbackUrl = new URL('/auth/callback', origin);
  callbackUrl.searchParams.set('next', next);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    redirect('/auth/login?error=' + encodeURIComponent(error.message));
  }

  // Supabase returns the URL to redirect to (the provider's authorize endpoint).
  // We redirect the browser there; the user authenticates with the provider,
  // and the provider redirects them back to /auth/callback with a code.
  if (data?.url) redirect(data.url);
}

// -----------------------------------------------------------------------------
// Logout (we'll use this in step 9, defining here for completeness)
// -----------------------------------------------------------------------------

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/auth/login');
}