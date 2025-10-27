export const WALLET_TYPE = {
  BREEZ: 'BREEZ',
  NWC: 'NWC',
} as const;

export type WalletType = (typeof WALLET_TYPE)[keyof typeof WALLET_TYPE];

export type Wallet = {
  getBalanceInSats: () => Promise<bigint>;
};
