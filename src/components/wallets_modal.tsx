import { useEffect, useState } from "react";
// import { X } from "lucide-react";

interface Wallet {
  id: string;
  name: string;
  icon: string;
}

const wallets = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "/wallets/metamask.svg",
  },
  {
    id: "phantom",
    name: "Phantom",
    icon: "/wallets/phantom.svg",
  },
  {
    id: "rabby",
    name: "Rabby",
    icon: "/wallets/rabby.svg",
  },
];

export default function WalletsModal({
  isOpen,
  onClose,
  onConnect,
}) {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Connect Wallet
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            X
          </button>
        </div>

        {/* Wallet List */}
        <div className="space-y-3">
          {wallets.length > 0 ? (
            wallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => onConnect?.(wallet)}
                className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 transition hover:border-indigo-500 hover:bg-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={wallet.icon}
                    alt={wallet.name}
                    className="h-8 w-8"
                  />

                  <span className="font-medium text-white">
                    {wallet.name}
                  </span>
                </div>

                <span className="text-sm text-zinc-400">
                  Connect
                </span>
              </button>
            ))
          ) : (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center">
              <p className="text-zinc-400">
                No wallet detected in this browser.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}