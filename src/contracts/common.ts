const Web3 = require('web3');

export const getWeb3WithProvider = () => {
  return new Web3(`https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`);
};

export const getContract = (ABI: any, contractAddress: string) => {
  const web3 = getWeb3WithProvider();
  const contract = new web3.eth.Contract(ABI, contractAddress);
  return contract;
};

export class Wallet {
  public web3: any;
  public wallets: any[] = [];

  constructor(web3) {
    this.web3 = web3;
  }

  importWallet = (privateKey: string) => {
    this.wallets.push(this.web3.eth.accounts.wallet.add(privateKey));
  };

  convertToHex = (value: string) => {
    return new this.web3.utils.BN(value).toString('hex');
  };

  getSignedTx = async (tx) => {
    return await this.web3.eth.accounts.signTransaction(
      tx,
      this.wallets[0].privateKey,
    );
  };

  toWei = (eth: string) => {
    return this.web3.utils.toWei(eth, 'ether');
  };

  toGWei = (wei: string) => {
    return this.web3.utils.fromWei(wei, 'gwei');
  };

  toEth = (wei: string) => {
    return this.web3.utils.fromWei(wei, 'ether');
  };

  sendSignedTx = async (tx: any) => {
    return await this.web3.eth.sendSignedTransaction(tx.rawTransaction);
  };

  getTransectionCount = async () => {
    return await this.web3.eth.getTransactionCount(this.wallets[0].address); // pending
  };

  getGasPrice = async () => {
    return await this.web3.eth.getGasPrice();
  };

  getEstimatedGas = async (tx) => {
    return await this.web3.eth.estimateGas(tx);
  };

  getLatestBlockInfo = async () => {
    return await this.web3.eth.getBlock('latest');
  };

  getTxObject = ({
    to = undefined,
    gas = undefined,
    chainId = 4,
    value = undefined,
    data = undefined,
    nonce = undefined,
    gasPrice = undefined,
    gasLimit = undefined,
    maxFeePerGas = undefined,
    maxPriorityFeePerGas = undefined,
  }) => {
    const tx = {
      from: this.wallets[0].address,
    };

    if (chainId) {
      // @ts-ignore
      tx.chainId = chainId; // pass it as hex for estimate gas else number
    }

    if (to) {
      // @ts-ignore
      tx.to = to;
    }

    if (value) {
      // @ts-ignore
      tx.value = '0x' + this.convertToHex(toWei(value));
    }

    if (data) {
      // @ts-ignore
      tx.data = data;
    }

    if (nonce) {
      // @ts-ignore
      tx.nonce = '0x' + this.convertToHex(nonce);
    }

    if (gas) {
      // @ts-ignore
      tx.gas = gas;
    }

    if (gasPrice) {
      // @ts-ignore
      tx.gasPrice = '0x' + this.convertToHex(gasPrice);
    }

    if (gasLimit) {
      // @ts-ignore
      tx.gasLimit = '0x' + this.convertToHex(gasLimit);
    }

    if (maxFeePerGas) {
      // @ts-ignore
      tx.maxFeePerGas = '0x' + this.convertToHex(maxFeePerGas);
    }

    if (maxPriorityFeePerGas) {
      // @ts-ignore
      tx.maxPriorityFeePerGas = '0x' + this.convertToHex(maxPriorityFeePerGas);
    }
    return tx;
  };
}
