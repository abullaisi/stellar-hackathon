'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';

import { useWallet } from '@/providers/wallet-provider';
import { useMe, useSignOut } from '@/services/auth';

function truncateAddress(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

/**
 * Funnel chrome for pre-subscription /dashboard states (prototype index.html /
 * subscribe.html pattern): a slim topbar (K mark + wordmark, wallet chip + disconnect
 * on the right once connected) and a 3-step CONNECT → PAY → UNLOCKED stepper. No
 * sidenav — that's the point, the funnel is a linear path, not a member area.
 */
export function FunnelShell({
  activeStep,
  children,
}: {
  /** 1 = not connected yet, 2 = connected, working toward subscribing. */
  activeStep: 1 | 2;
  children: ReactNode;
}) {
  const { isConnected, address, disconnect } = useWallet();
  const me = useMe();
  const signOut = useSignOut();
  const isAuthed = !!me.data;

  async function handleDisconnect() {
    if (isAuthed) await signOut.mutateAsync();
    disconnect();
  }

  return (
    <main className="funnel-shell">
      <div className="topbar">
        <Link href="/" className="logo">
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/logo-mark.png`}
            alt=""
            className="logo-mark"
            style={{ height: 26, width: 'auto', display: 'block' }}
          />
          Komunify
        </Link>
        <nav className="topbar-nav">
          {isConnected && address ? (
            <>
              <code title={address}>{truncateAddress(address)}</code>
              <button type="button" className="disconnect-link" onClick={handleDisconnect} disabled={signOut.isPending}>
                Disconnect
              </button>
            </>
          ) : null}
        </nav>
      </div>

      <div className="card">
        <div className="funnel-stepper">
          <div className={`step ${activeStep === 1 ? 'active' : 'done'}`}>
            <span className="step-dot">{activeStep === 1 ? '1' : '✓'}</span>
            <span className="step-name">Connect</span>
          </div>
          <div className={`step-line ${activeStep >= 2 ? 'lit' : ''}`} />
          <div className={`step ${activeStep === 2 ? 'active' : 'todo'}`}>
            <span className="step-dot">2</span>
            <span className="step-name">Pay</span>
          </div>
          <div className="step-line" />
          <div className="step todo">
            <span className="step-dot">3</span>
            <span className="step-name">Unlocked</span>
          </div>
        </div>
      </div>

      {children}
    </main>
  );
}
