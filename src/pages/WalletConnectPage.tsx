import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../lib/walletContext";
// import {
//   Wallet,
//   ArrowRight,
//   ShieldCheck,
//   Lock,
//   ChartLineUp,
// } from "@phosphor-icons/react";
import WalletsModal from "../components/wallets_modal";
import { FaLock, FaArrowRight } from "react-icons/fa";


export default function WalletConnectPage() {
  const { isConnected, isConnecting, connect, openModal, setOpenModal } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected) {
      navigate("/", { replace: true });
    }
  }, [isConnected, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-base text-foreground tracking-tight">
            Wallet Login
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground border border-border px-3 py-1 rounded-full bg-muted/30">
            PROTOCOL: ACTIVE
          </span>
          <span className="font-mono text-xs text-muted-foreground border border-border px-3 py-1 rounded-full bg-muted/30">
            CHAIN: ETH
          </span>
        </div>
      </header>

      {/* Main content */}
      
      <div className="flex-1 flex items-center justify-center px-4 py-16 ">
        <div className="w-full max-w-lg bg-white rounded-lg shadow-md overflow-hidden p-16">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs tracking-widest text-primary bg-primary/10 border border-primary/30 rounded-full px-3 py-1.5 uppercase">
              <FaLock size={11} />
              Secure Access Required
            </span>
          </div>

          {/* Heading */}
          <div className="text-center mb-10">
            <h1 className="font-heading text-4xl md:text-5xl tracking-tight text-foreground mb-4 leading-tight">
              Connect Your Wallet
            </h1>
            <p className="font-mono text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Access tokenized real estate, track your equity accumulation, and
              manage on-chain ownership — all from a single interface.
            </p>
          </div>

          {/* Feature highlights */}
          <button
            className="block w-full px-3 py-2 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
            onClick={() => setOpenModal(true)}
            disabled={isConnecting}
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
            <FaArrowRight className="ml-2 inline" />
          </button>

          <p className="text-center font-mono text-xs text-muted-foreground mt-4">
            By connecting, you agree to the{" "}
            <span className="text-primary underline underline-offset-2 cursor-pointer">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-primary underline underline-offset-2 cursor-pointer">
              Privacy Policy
            </span>
          </p>
        </div>
      </div>

      {/* Footer strip */}
      <div className="border-t border-border px-6 py-3 flex items-center justify-center gap-6">
        {["RWA: LIVE", "EQUITY: ON-CHAIN", "TVL: $16.7M", "PROPERTIES: 6"].map(
          (item) => (
            <span
              key={item}
              className="font-mono text-xs text-muted-foreground tracking-widest whitespace-nowrap"
            >
              <span className="text-primary mr-1">▸</span>
              {item}
            </span>
          ),
        )}
      </div>

      <WalletsModal isOpen={openModal} onClose={() => setOpenModal(false)} onConnect={(connector) => connect(connector)} />
    </div>
  );
}
