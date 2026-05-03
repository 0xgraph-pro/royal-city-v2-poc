declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
    phantom?: any;
    tronLink?: any;
    tronWeb?: any;
  }
}

export type WalletId = "metamask" | "phantom" | "tron" | "rabby";

export interface WalletConnection {
  address: string;
  chain: string;
  extra?: string;
}

// EIP-6963: discover all injected EVM providers so multiple extensions
// (MetaMask + Safe + Rabby + ...) don't clobber each other on window.ethereum.
type Eip6963ProviderInfo = {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
};
type Eip6963ProviderDetail = { info: Eip6963ProviderInfo; provider: any };

function discoverInjectedProviders(): Eip6963ProviderDetail[] {
  if (typeof window === "undefined") return [];
  const found: Eip6963ProviderDetail[] = [];
  const onAnnounce = (event: any) => {
    const detail = event.detail as Eip6963ProviderDetail;
    if (detail && !found.find((d) => d.info.uuid === detail.info.uuid)) {
      found.push(detail);
    }
  };
  window.addEventListener("eip6963:announceProvider", onAnnounce as any);
  window.dispatchEvent(new Event("eip6963:requestProvider"));
  // Synchronous: handlers fire immediately during dispatchEvent.
  window.removeEventListener("eip6963:announceProvider", onAnnounce as any);
  return found;
}

function pickProvider(match: (info: Eip6963ProviderInfo) => boolean) {
  const providers = discoverInjectedProviders();
  return providers.find((p) => match(p.info))?.provider ?? null;
}

async function connectMetaMask(): Promise<WalletConnection> {
  console.log("Discovering EIP-6963 providers...");
  if (typeof window === "undefined") throw new Error("MetaMask not detected.");
  // Prefer the EIP-6963 announced MetaMask provider so Safe/other extensions
  // can't hijack the request via window.ethereum.
  const provider =
    pickProvider((i) => i.rdns === "io.metamask" || /metamask/i.test(i.name)) ||
    (window.ethereum?.providers?.find?.((p: any) => p.isMetaMask) ?? null) ||
    (window.ethereum?.isMetaMask ? window.ethereum : null);
  if (!provider) {
    throw new Error("MetaMask not detected. Install the MetaMask extension.");
  }
  const accounts: string[] = await provider.request({
    method: "eth_requestAccounts",
  });
  const chainId: string = await provider.request({ method: "eth_chainId" });
  if (!accounts?.[0]) throw new Error("No account returned by MetaMask.");
  return { address: accounts[0], chain: "Ethereum", extra: `chainId ${chainId}` };
}

async function connectPhantom(): Promise<WalletConnection> {
  const provider =
    (typeof window !== "undefined" && (window.phantom?.solana || window.solana)) || null;
  if (!provider?.isPhantom) {
    throw new Error("Phantom not detected. Install the Phantom extension.");
  }
  const resp = await provider.connect();
  const address = resp?.publicKey?.toString?.() ?? provider.publicKey?.toString?.();
  if (!address) throw new Error("No public key returned by Phantom.");
  return { address, chain: "Solana" };
}

async function connectTron(): Promise<WalletConnection> {
  if (typeof window === "undefined" || !window.tronLink) {
    throw new Error("TronLink not detected. Install the TronLink extension.");
  }
  const res = await window.tronLink.request({ method: "tron_requestAccounts" });
  if (res?.code && res.code !== 200) {
    throw new Error(res.message || "TronLink rejected the request.");
  }
  const address = window.tronLink.tronWeb?.defaultAddress?.base58 || window.tronWeb?.defaultAddress?.base58;
  if (!address) throw new Error("No TRON address available. Unlock TronLink and retry.");
  return { address, chain: "TRON" };
}

async function connectRabby(): Promise<WalletConnection> {
  if (typeof window === "undefined") throw new Error("Rabby not detected.");
  const provider =
    pickProvider((i) => i.rdns === "io.rabby" || /rabby/i.test(i.name)) ||
    (window.ethereum?.providers?.find?.((p: any) => p.isRabby) ?? null) ||
    (window.ethereum?.isRabby ? window.ethereum : null);
  if (!provider) {
    throw new Error("Rabby not detected. Install the Rabby browser extension.");
  }
  const accounts: string[] = await provider.request({
    method: "eth_requestAccounts",
  });
  const chainId: string = await provider.request({ method: "eth_chainId" });
  if (!accounts?.[0]) throw new Error("No account returned by Rabby.");
  return { address: accounts[0], chain: "Ethereum", extra: `chainId ${chainId}` };
}

async function connectSafe(): Promise<WalletConnection> {
  // Two ways to connect to Safe:
  // 1. The Safe{Wallet} browser extension injects an EIP-6963 provider.
  // 2. This app is loaded as a Safe App inside Safe{Wallet} (iframe) — uses the SDK.
  const extProvider = pickProvider(
    (i) => i.rdns === "global.safe" || /^safe\b/i.test(i.name),
  );
  if (extProvider) {
    const accounts: string[] = await extProvider.request({
      method: "eth_requestAccounts",
    });
    const chainId: string = await extProvider.request({ method: "eth_chainId" });
    if (!accounts?.[0]) throw new Error("No account returned by Safe extension.");
    return { address: accounts[0], chain: "Safe", extra: `chainId ${chainId}` };
  }

  // Fallback: Safe Apps SDK (only works when iframed inside Safe Wallet).
  const { default: SafeAppsSDK } = await import("@safe-global/safe-apps-sdk");
  const sdk = new SafeAppsSDK();
  const info = await Promise.race([
    sdk.safe.getInfo(),
    new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              "Safe not detected. Install the Safe{Wallet} browser extension, or open this URL inside Safe Wallet → Apps → Custom App.",
            ),
          ),
        1500,
      ),
    ),
  ]);
  // @ts-expect-error race result typing
  const { safeAddress, chainId } = info;
  return { address: safeAddress, chain: "Safe", extra: `chainId ${chainId}` };
}

export const connectMap: Record<WalletId, () => Promise<WalletConnection>> = {
  metamask: connectMetaMask,
  phantom: connectPhantom,
  tron: connectTron,
  rabby: connectRabby,
};