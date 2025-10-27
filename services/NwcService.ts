import { Wallet } from '@/models/WalletType';
import {
  BreezSdkInterface,
  Network,
  Seed,
  connect,
  defaultConfig,
} from '@breeztech/breez-sdk-spark-react-native';
import * as FileSystem from 'expo-file-system';

export class NwcService implements Wallet {
  private constructor(private readonly client: BreezSdkInterface) {}

  public static async create(mnemonic: string): Promise<NwcService> {
    const seed = new Seed.Mnemonic({ mnemonic, passphrase: undefined });
    const config = defaultConfig(Network.Mainnet);
    config.apiKey = process.env.EXPO_PUBLIC_BREEZ_API_KEY;

    const dirUri = FileSystem.documentDirectory + 'breez-wallet';
    const storageDir = dirUri.replace('file://', '');
    await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
    const client = await connect({ seed, config, storageDir });

    return new NwcService(client);
  }

  public async getBalanceInSats(): Promise<bigint> {
    const info = await this.client.getInfo({ ensureSynced: false });
    return info.balanceSats;
  }
}
