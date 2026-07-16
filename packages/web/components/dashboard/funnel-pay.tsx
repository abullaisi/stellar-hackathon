'use client';

import { SplitCard } from './split-card';
import { SubscriptionCard } from './subscription-card';

/**
 * FunnelShell step-2 content (prototype subscribe.html pattern): the existing
 * subscription card (price, faucet, Subscribe CTA, balance gate — all unchanged
 * logic) plus the automatic-split breakdown, centered in a single pay column.
 */
export function FunnelPay() {
  return (
    <div className="pay-col">
      <SubscriptionCard />
      <SplitCard />
    </div>
  );
}
