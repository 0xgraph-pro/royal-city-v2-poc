
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { connectMap } from "./connect";
import { toast } from "react-toastify";

type WalletContextType = {
  address: string | null;
  error: string | null;
  success: string | null;
  message: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  openModal: boolean;
  setOpenModal: (open: boolean) => void;
  connect: (walletIndex: number) => void;
  disconnect: () => void;
};

const WalletContext = createContext<WalletContextType>({
  address: null,
  error: null,
  success: null,
  message: null,
  isConnected: false,
  isConnecting: false,
  openModal: false,
  setOpenModal: (open) => {},
  connect: () => {},
  disconnect: () => {},
});

const STORAGE_KEY = "equity_terminal_wallet";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setAddress(stored);
  }, []);

  const connectWallet = useCallback(async (connector) => {
    setIsConnecting(true);
    try {
      const res = await connectMap[connector.id]();
      // Simulate brief connection delay, then store a demo address
      setIsConnecting(false);
      setOpenModal(false);
      localStorage.setItem(STORAGE_KEY, res.address);
      setAddress(res.address);
      toast.success(`Connected to Wallet Successfully!`);
    } catch (err) {
      console.error("Failed to connect wallet.");
      toast.error("Failed to connect wallet. Please try again.");
      setOpenModal(false);
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAddress(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        error,
        success, 
        message,
        isConnected: !!address,
        isConnecting,
        openModal,
        setOpenModal,
        connect: connectWallet,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
