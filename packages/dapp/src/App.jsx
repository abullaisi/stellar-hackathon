import { useCallback, useEffect, useState } from "react";
import { connectWallet, signWithWallet } from "./wallet";
import {
  fetchBalance,
  fundWithFriendbot,
  buildPaymentXdr,
  submitSignedXdr,
  explorerTxUrl,
  shortAddress,
  TESTNET_PASSPHRASE,
} from "./stellar";
import {
  subscribe,
  getStats,
  classifyError,
  explorerContractUrl,
  CONTRACT_ID,
} from "./komunify";

const PARTNERS = [
  { name: "Dev Web3 Bandung", initial: "D", avatarCls: "" },
  { name: "Stellar ID Collective", initial: "S", avatarCls: "a2" },
  { name: "Circolo Creative Lab", initial: "C", avatarCls: "a3" },
];

const SPLIT = [
  { name: "Project owner", pct: 70, cls: "" },
  { name: "Community manager", pct: 20, cls: "dim" },
  { name: "Komunify platform", pct: 10, cls: "dimmer" },
];

function fmtXlm(n) {
  const v = Number(n) || 0;
  return `${v.toLocaleString(undefined, { maximumFractionDigits: 2 })} XLM`;
}

function AllocRows({ totalXlm }) {
  return SPLIT.map((s) => (
    <div className="alloc-row" key={s.name}>
      <span>{s.name}</span>
      <span className="alloc-pct">{s.pct}%</span>
      <span className="alloc-amt">{fmtXlm((totalXlm * s.pct) / 100)}</span>
      <span className="alloc-track">
        <span className={`alloc-fill ${s.cls}`} style={{ width: `${s.pct}%` }} />
      </span>
    </div>
  ));
}

export default function App() {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [busy, setBusy] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [tx, setTx] = useState({ status: "idle", hash: "", error: "" });
  const [subAmount, setSubAmount] = useState("10");
  const [sub, setSub] = useState({ status: "idle", hash: "", error: "" });
  const [stats, setStats] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      setStats(await getStats());
    } catch (err) {
      // stats are progressive enhancement; keep the app usable if RPC hiccups
      console.warn("Komunify stats unavailable:", err);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const refreshBalance = useCallback(
    async (addr) => {
      const target = addr || address;
      if (!target) return;
      try {
        setBalance(await fetchBalance(target));
      } catch (err) {
        setConnectError(`Failed to load balance: ${err.message}`);
      }
    },
    [address]
  );

  async function connect() {
    setConnectError("");
    try {
      const addr = await connectWallet();
      setAddress(addr);
      await refreshBalance(addr);
    } catch (err) {
      setConnectError(
        err.message || "Could not connect a wallet. Is one installed?"
      );
    }
  }

  function disconnect() {
    setAddress(null);
    setBalance(null);
    setConnectError("");
    setTx({ status: "idle", hash: "", error: "" });
  }

  async function fund() {
    setBusy(true);
    setConnectError("");
    try {
      await fundWithFriendbot(address);
      await refreshBalance();
    } catch (err) {
      setConnectError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function send(e) {
    e.preventDefault();
    setTx({ status: "signing", hash: "", error: "" });
    try {
      const xdr = await buildPaymentXdr(address, destination.trim(), amount);
      const signedXdr = await signWithWallet(xdr, address, TESTNET_PASSPHRASE);
      setTx({ status: "submitting", hash: "", error: "" });
      const result = await submitSignedXdr(signedXdr);
      setTx({ status: "success", hash: result.hash, error: "" });
      setDestination("");
      setAmount("");
      await refreshBalance();
    } catch (err) {
      const codes = err?.response?.data?.extras?.result_codes;
      setTx({
        status: "error",
        hash: "",
        error: codes ? JSON.stringify(codes) : err.message || "Transaction failed",
      });
    }
  }

  async function paySubscription(e) {
    e.preventDefault();
    setSub({ status: "signing", hash: "", error: "" });
    try {
      const hash = await subscribe(address, subAmount);
      setSub({ status: "success", hash, error: "" });
      await Promise.all([refreshBalance(), loadStats()]);
    } catch (err) {
      setSub({ status: "error", hash: "", error: classifyError(err) });
    }
  }

  const sending = tx.status === "signing" || tx.status === "submitting";
  const subscribing = sub.status === "signing" || sub.status === "submitting";
  const subscribed = sub.status === "success";
  const payAmount = Number(subAmount) || 0;
  const volumeXlm = stats?.volumeXlm ?? 0;

  return (
    <main className="shell">
      <div className="topbar">
        <a className="logo" href="#top">
          Komunify
        </a>
        <nav className="topbar-nav">
          <a href="#connect">Connect</a>
          <a href="#subscribe">Subscribe</a>
          <a href="#traction">Traction</a>
          {address && <code title={address}>{shortAddress(address)}</code>}
        </nav>
      </div>

      <div className="card">
        <div className="stepper">
          <div className={`step ${address ? "done" : "active"}`}>
            <span className="step-dot">{address ? "✓" : "1"}</span>
            <span className="step-name">Connect</span>
          </div>
          <div className={`step-line ${address ? "lit" : ""}`} />
          <div
            className={`step ${subscribed ? "done" : address ? "active" : "todo"}`}
          >
            <span className="step-dot">{subscribed ? "✓" : "2"}</span>
            <span className="step-name">Pay</span>
          </div>
          <div className={`step-line ${subscribed ? "lit" : ""}`} />
          <div className={`step ${subscribed ? "done" : "todo"}`}>
            <span className="step-dot">{subscribed ? "✓" : "3"}</span>
            <span className="step-name">Unlocked</span>
          </div>
        </div>
      </div>

      <div className="grid-2" id="connect">
        <section className="card center">
          <h1 className="headline">
            One payment.<span className="gold">Every community.</span>
          </h1>
          <p className="hint">
            Subscribe once on Stellar and get member benefits from every
            partner community in the bundle.
          </p>
          <div className="row tight" style={{ justifyContent: "center" }}>
            <span className="avatar-group">
              {PARTNERS.map((p) => (
                <span
                  className={`avatar ${p.avatarCls}`}
                  key={p.name}
                  title={p.name}
                >
                  {p.initial}
                </span>
              ))}
            </span>
            <span className="avatar-note">
              3 partner communities in this bundle
            </span>
          </div>
        </section>

        {!address ? (
          <section className="card center">
            <div className="num-label">
              <span className="num">01</span> WALLET
            </div>
            <p className="hint">
              Works with Freighter, xBull, Albedo, Lobstr, Hana, and more. Set
              your wallet to Testnet.
            </p>
            <button onClick={connect}>Connect Wallet</button>
            {connectError && <p className="error">{connectError}</p>}
          </section>
        ) : (
          <section className="card">
            <span className="label">Wallet</span>
            <div className="row tight">
              <code title={address}>{shortAddress(address)}</code>
              <span className="pill ok">TESTNET</span>
            </div>
            <span className="label" style={{ marginTop: 12, display: "block" }}>
              XLM balance
            </span>
            <div className="balance">
              {balance ? fmtXlm(balance.xlm) : "…"}
            </div>
            <div className="row tight">
              {balance && !balance.funded && (
                <button onClick={fund} disabled={busy}>
                  {busy ? "Funding…" : "Fund with Friendbot"}
                </button>
              )}
              <button className="ghost" onClick={() => refreshBalance()}>
                Refresh
              </button>
              <button className="ghost" onClick={disconnect}>
                Disconnect
              </button>
            </div>
            {balance && !balance.funded && (
              <p className="hint">
                This account isn't on the ledger yet. Friendbot sends free
                testnet XLM to activate it.
              </p>
            )}
            {connectError && <p className="error">{connectError}</p>}
          </section>
        )}
      </div>

      <div className="grid-2" id="subscribe">
        <section className="card">
          <div className="num-label">
            <span className="num">02</span> SUBSCRIPTION
          </div>
          <h2>Community Bundle, monthly</h2>
          <div className="balance">{fmtXlm(payAmount)}</div>
          <div className="benefit-line">
            <span>Member benefits at every partner community</span>
          </div>
          <div className="benefit-line">
            <span>Subscriber prices on partner items</span>
          </div>
          <div className="benefit-line">
            <span>On-chain receipt for every payment</span>
          </div>
          <form onSubmit={paySubscription}>
            <label>
              Amount (XLM)
              <input
                value={subAmount}
                onChange={(e) => setSubAmount(e.target.value)}
                type="number"
                min="1"
                step="any"
                required
              />
            </label>
            <button disabled={!address || subscribing || subscribed}>
              {subscribed
                ? "Subscribed"
                : subscribing
                  ? "Confirming…"
                  : `Pay ${fmtXlm(payAmount)}`}
            </button>
          </form>
          {!address && (
            <p className="hint">Connect your wallet above to subscribe.</p>
          )}
          {subscribing && (
            <div className="toast pending">
              <span className="toast-dot" />
              <div className="t-msg">
                Confirming on Stellar testnet
                <div className="t-sub">
                  Waiting for signature and ledger close
                </div>
              </div>
            </div>
          )}
          {subscribed && (
            <div className="toast tx-success">
              <span className="toast-dot" />
              <div className="t-msg">
                Subscription active
                <div className="t-sub">
                  Tx{" "}
                  <a
                    href={explorerTxUrl(sub.hash)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <code title={sub.hash}>{sub.hash.slice(0, 10)}…</code>
                  </a>
                </div>
              </div>
            </div>
          )}
          {sub.status === "error" && <p className="error">{sub.error}</p>}
        </section>

        <section className="card split-flow">
          <div className="num-label">
            <span className="num">03</span> AUTOMATIC SPLIT
          </div>
          <p className="hint">
            The Soroban contract splits every payment the moment it settles.
          </p>
          <AllocRows totalXlm={payAmount} />
          <p className="hint">
            Contract{" "}
            <a href={explorerContractUrl()} target="_blank" rel="noreferrer">
              <code title={CONTRACT_ID}>
                {CONTRACT_ID.slice(0, 8)}…{CONTRACT_ID.slice(-6)}
              </code>
            </a>
          </p>
        </section>
      </div>

      <section id="traction">
        <div className="card">
          <div className="num-label">
            <span className="num">04</span> TRACTION
          </div>
          <h2>Live on-chain traction</h2>
          <p className="hint">
            Every number below reads from the Komunify contract on Stellar
            testnet.
          </p>
          {stats ? (
            <div className="stat-strip">
              <div className="stat-chip">
                <span className="label">Subscribers</span>
                <div className="stat-value">{stats.count}</div>
              </div>
              <div className="stat-chip">
                <span className="label">Volume</span>
                <div className="stat-value">{fmtXlm(volumeXlm)}</div>
              </div>
              <div className="stat-chip">
                <span className="label">Payout events</span>
                <div className="stat-value">{stats.count * 3}</div>
              </div>
            </div>
          ) : (
            <p className="hint">Loading from testnet…</p>
          )}
        </div>
      </section>

      <div className="grid-2">
        <section className="card">
          <span className="label">Payout split to date</span>
          <AllocRows totalXlm={volumeXlm} />
        </section>

        <section className="card">
          <h2>Send a contribution</h2>
          <form onSubmit={send}>
            <label>
              Destination address
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="G…"
                required
                disabled={!address}
              />
            </label>
            <label>
              Amount (XLM)
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                min="0.0000001"
                step="any"
                placeholder="10"
                required
                disabled={!address}
              />
            </label>
            <button disabled={!address || sending}>
              {tx.status === "signing"
                ? "Waiting for signature…"
                : tx.status === "submitting"
                  ? "Submitting…"
                  : "Send XLM"}
            </button>
          </form>
          {!address && (
            <p className="hint">Connect your wallet to send testnet XLM.</p>
          )}
          {tx.status === "success" && (
            <p className="success">
              Payment sent ✓ Transaction:{" "}
              <a href={explorerTxUrl(tx.hash)} target="_blank" rel="noreferrer">
                <code>{tx.hash.slice(0, 10)}…</code>
              </a>
            </p>
          )}
          {tx.status === "error" && (
            <p className="error">Transaction failed: {tx.error}</p>
          )}
        </section>
      </div>

      <footer>
        Built at Build on Stellar Bootcamp Bandung · APAC Stellar Hackathon
        2026 ·{" "}
        <a href="https://github.com/abullaisi/stellar-hackathon">GitHub</a>
      </footer>
    </main>
  );
}
