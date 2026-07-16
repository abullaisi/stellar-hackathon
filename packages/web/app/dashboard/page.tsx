'use client';

import { AppShell } from '@/components/app-shell/app-shell';
import { FunnelShell } from '@/components/app-shell/funnel-shell';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { FunnelConnect } from '@/components/dashboard/funnel-connect';
import { FunnelPay } from '@/components/dashboard/funnel-pay';
import { useWallet } from '@/providers/wallet-provider';
import { useSubscriptionStatus } from '@/services/subscription';

/**
 * State-dependent chrome (funnel pattern, prototype index.html/subscribe.html):
 * not-connected and connected-not-subscribed swap the sidenav for the slim
 * topbar + stepper funnel. Once subscribed, the existing sidenav dashboard
 * takes over unchanged. All state comes from the wallet provider and the
 * existing `useSubscriptionStatus` query — no new data fetching.
 */
export default function DashboardPage() {
  const { isConnected } = useWallet();
  const status = useSubscriptionStatus();
  const isSubscribed = !!status.data?.isActive;

  if (!isConnected) {
    return (
      <FunnelShell activeStep={1}>
        <FunnelConnect />
      </FunnelShell>
    );
  }

  if (!isSubscribed) {
    return (
      <FunnelShell activeStep={2}>
        <FunnelPay />
      </FunnelShell>
    );
  }

  return (
    <AppShell>
      <main className="shell shell-wide">
        <DashboardShell />
      </main>
    </AppShell>
  );
}
