import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useMnemonic } from './MnemonicContext';
import { Wallet, WalletType, WALLET_TYPE } from '@/models/WalletType';
import { BreezService } from '@/services/BreezService';
import { NwcService } from '@/services/NwcService';

// Context type definition
export interface WalletManagerContextType {
  balanceInSats?: bigint;
  refreshWalletInfo: () => Promise<void>;
  switchActiveWallet: (walletType: WalletType) => Promise<void>;
}

// Provider component
interface WalletManagerContextProviderProps {
  children: React.ReactNode;
}

// Create context with default values
const WalletManagerContext = createContext<WalletManagerContextType | null>(null);

export const WalletManagerContextProvider: React.FC<WalletManagerContextProviderProps> = ({
  children,
}) => {
  const { mnemonic } = useMnemonic();
  const [activeWallet, setActiveWallet] = useState<Wallet | undefined>(undefined);
  const [balanceInSats, setBalanceInSats] = useState<bigint | undefined>(undefined);

  const refreshWalletInfo = useCallback(async () => {
    if (!activeWallet) {
      throw new Error('Active wallet is not set. Cannot refresh wallet info.');
    }

    const balance = await activeWallet.getBalanceInSats();
    setBalanceInSats(balance);
  }, [activeWallet]);

  const switchActiveWallet = useCallback(
    async (walletType: WalletType) => {
      if (!mnemonic) {
        throw new Error('Mnemonic is not available. Cannot switch wallet.');
      }

      if (walletType === WALLET_TYPE.BREEZ) {
        const breezWallet = await BreezService.create(mnemonic);
        setActiveWallet(breezWallet);
      } else if (walletType === WALLET_TYPE.NWC) {
        const nwcWallet = await NwcService.create(mnemonic);
        setActiveWallet(nwcWallet);
      } else {
        throw new Error(`Unsupported wallet type: ${walletType}`);
      }
    },
    [mnemonic]
  );

  useEffect(() => {
    const initializeWallet = async () => {
      if (!mnemonic) {
        console.info('Mnemonic is not available yet. Cannot initialize wallet.');
        return;
      }

      switchActiveWallet(WALLET_TYPE.BREEZ);
    };

    initializeWallet();
  }, [mnemonic, switchActiveWallet]);

  const contextValue: WalletManagerContextType = {
    balanceInSats,
    refreshWalletInfo,
    switchActiveWallet,
  };

  return (
    <WalletManagerContext.Provider value={contextValue}>{children}</WalletManagerContext.Provider>
  );
};

export const useWalletManager = () => {
  const context = useContext(WalletManagerContext);
  if (!context) {
    throw new Error('useWalletManager must be used within a WalletManagerProvider');
  }
  return context;
};

export default WalletManagerContextProvider;
