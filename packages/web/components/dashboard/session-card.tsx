'use client';

import { Button } from '@/components/ui/button';
import { useWallet } from '@/providers/wallet-provider';
import { useSignIn, useSignOut } from '@/services/auth';

function shortAddr(a: string): string {
  return `${a.slice(0, 4)}…${a.slice(-4)}`;
}

/**
 * Wallet-signature session gate (D-001). Connecting Freighter is not a session — the API's
 * `kmf_session` cookie is what `POST /content/upload`, `/confirm`, and `GET /:id/download`
 * require. This turns a connected wallet into a signed-in session (challenge → signMessage →
 * verify). Rendered by `DashboardShell`; the panels below it only appear once `me` resolves.
 */
export function SignInCard({
  onSignedIn,
}: {
  onSignedIn?: () => void;
}) {
  const { address } = useWallet();
  const signIn = useSignIn();

  async function handle() {
    await signIn.mutateAsync();
    onSignedIn?.();
  }

  return (
    <section className="card center">
      <p className="hint" style={{ marginTop: 0 }}>
        Sign a message with your wallet to start your session — this unlocks publishing and
        downloads. No gas, no password.
      </p>
      <Button type="button" onClick={handle} disabled={signIn.isPending || !address}>
        {signIn.isPending ? 'Signing…' : 'Sign in'}
      </Button>
      {signIn.isError ? (
        <p className="error" style={{ marginBottom: 0 }}>
          {signIn.error instanceof Error ? signIn.error.message : 'Sign-in failed'}
        </p>
      ) : null}
    </section>
  );
}

/** Compact "signed in as G…XXXX · Sign out" row for the header once a session exists. */
export function SessionBadge() {
  const { address } = useWallet();
  const signOut = useSignOut();
  if (!address) return null;
  return (
    <div className="row tight" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <span className="label">Signed in as {shortAddr(address)}</span>
      <Button type="button" size="sm" variant="outline" onClick={() => signOut.mutate()} disabled={signOut.isPending}>
        Sign out
      </Button>
    </div>
  );
}
