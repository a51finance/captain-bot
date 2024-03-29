import { Controller } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { CONTRACT_ADDRESSES, SUBGRAPH_URI, URL_ETHERSCAN } from 'src/constants';
import { getWeb3WithProvider, Wallet } from 'src/contracts/common';
import { getOverAllStatus, reAdjust } from 'src/contracts/functions/Unipilot';

import { subgraphRequest } from 'src/utils';
const { FeeMarketEIP1559Transaction } = require('@ethereumjs/tx');
const Common = require('@ethereumjs/common').default;

const params = {
  uniPools: {
    uniswapPool: {
      id: true,
      tick: true,
      feeTier: true,
      token0: {
        id: true,
      },
      token1: {
        id: true,
      },
    },
  },
};

@Controller()
export class BotController {
  constructor() {}

  @Interval(1000 * 60 * 15)
  async getHello() {
    try {
      let web3 = getWeb3WithProvider();
      const wallet = new Wallet(web3);

      let outOfRangePositions: any[] = [];

      const data: any = await subgraphRequest(SUBGRAPH_URI, params);

      const minTick = -887272;
      const maxTick = 887272;

      data?.uniPools.forEach((position: any, idx) => {
        if (!position?.uniswapPool?.tick) return;

        const tickInRange =
          parseFloat(position?.uniswapPool?.tick) > minTick &&
          parseFloat(position?.uniswapPool?.tick) < maxTick;

        if (tickInRange) {
          outOfRangePositions.push({
            poolAddress: position?.uniswapPool?.id,
            token0Address: position?.uniswapPool?.token0?.id,
            token1Address: position?.uniswapPool?.token1?.id,
            feeTier: position?.uniswapPool?.feeTier,
          });
        }
      });

      wallet.importWallet(process.env.PRIVATE_KEY);

      let txCount = await wallet.getTransectionCount();

      let allowedToRebase = [];
      let overAll = await getOverAllStatus(
        outOfRangePositions.map((o) => o.poolAddress),
      );

      outOfRangePositions.forEach((position, idx) => {
        if (overAll[idx]) allowedToRebase.push(position);
      });

      await this.rebase({
        wallet,
        positions: allowedToRebase,
        txCount: txCount,
        idx: 0,
      });
    } catch (e) {}
  }

  async rebase({ wallet, positions, txCount, idx }: any) {
    if (positions.length <= idx) return;

    try {
      const _reAdjust = reAdjust({
        token0: positions[idx]?.token0Address,
        token1: positions[idx]?.token1Address,
        feeTier: positions[idx]?.feeTier,
      });

      const txObject = wallet.getTxObject({
        to: CONTRACT_ADDRESSES.LiquidityManager,
        data: _reAdjust,
        nonce: txCount,
        gasLimit: `${1200000}`,
        maxFeePerGas: '250000000000',
        maxPriorityFeePerGas: '1000000000',
        type: '2',
      });

      let chain = new Common({ chain: 'mainnet', hardfork: 'london' });

      const transaction = FeeMarketEIP1559Transaction.fromTxData(txObject, {
        chain,
      });

      const signedTransaction = transaction.sign(
        Buffer.from(wallet.wallets[0].privateKey.slice(2), 'hex'),
      );
      const txSigned = '0x' + signedTransaction.serialize().toString('hex');

      const tx = await wallet.sendSignedTx({ rawTransaction: txSigned });

      console.log('TX Info => ', {
        nonce: txCount,
        tx: `${URL_ETHERSCAN}${tx?.transactionHash}`,
        from: wallet.wallets[0].address,
        cumulativeGasUsed: tx?.cumulativeGasUsed,
        effectiveGasPrice: `${parseInt(
          wallet.toGWei(tx?.effectiveGasPrice),
        )} GWei`,
      });
      console.log('Pool address => ', positions[idx].poolAddress);
      this.rebase({ wallet, positions, txCount: txCount + 1, idx: idx + 1 });
    } catch (e) {
      this.rebase({ wallet, positions, txCount: txCount, idx: idx + 1 });
    }
  }
}
