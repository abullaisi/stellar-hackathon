'use client';

import { formatTokenAmount } from '@/lib/contracts';
import { getStellarConfig } from '@/lib/stellar';
import { useConfig } from '@/services/subscription';

const SPLIT = [
  { name: 'Project owner', pct: 70 },
  { name: 'Community manager', pct: 20 },
  { name: 'Komunify platform', pct: 10 },
] as const;

function shortHash(id: string): string {
  return id.length > 12 ? `${id.slice(0, 6)}…${id.slice(-6)}` : id;
}

/**
 * "03 AUTOMATIC SPLIT" card (prototype subscribe.html split-flow pattern). Reuses the
 * existing `useConfig` price query and the contract id already read from
 * `getStellarConfig()` (`NEXT_PUBLIC_KOMUNIFY_CONTRACT_ID`); the split percentages
 * mirror the contract's fixed allocation (70/20/10) and are display-only copy.
 */
export function SplitCard() {
  const config = useConfig();
  const { komunifyContractId } = getStellarConfig();
  const price = config.data?.price;

  return (
    <section className="card split-flow">
      <div className="num-label">
        <span className="num">03</span> AUTOMATIC SPLIT
      </div>
      <p className="hint">The Soroban contract splits every payment the moment it settles.</p>
      <div>
        {SPLIT.map((s) => (
          <div className="alloc-row" key={s.name}>
            <span className="alloc-name">{s.name}</span>
            <span className="alloc-pct">{s.pct}%</span>
            <span className="alloc-amt">
              {price !== undefined ? formatTokenAmount((price * BigInt(s.pct)) / 100n) : '…'} USDC
            </span>
            <div className="alloc-track">
              <div className="alloc-fill" style={{ width: `${s.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="hint">
        Split contract{' '}
        <code title={komunifyContractId || undefined}>
          {komunifyContractId ? shortHash(komunifyContractId) : '—'}
        </code>
      </p>
    </section>
  );
}
