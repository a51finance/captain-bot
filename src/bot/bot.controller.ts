import { Controller } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { CONTRACT_ADDRESSES, SUBGRAPH_URI, URL_ETHERSCAN } from 'src/constants';
import BigNumber from 'bignumber.js';
import { getWeb3WithProvider, Wallet } from 'src/contracts/common';
import {
  reAdjust,
  readjustFrequencyStatusAll,
} from 'src/contracts/functions/Unipilot';
import { shouldReAdjustAll } from 'src/contracts/functions/UniState';
import { subgraphRequest } from 'src/utils';

const params = {
  unipilotPositions: {
    __args: {
      where: {
        liquidity_gt: 0,
      },
    },
    id: true,
    liquidity: true,
    pool: {
      tick: true,
      liquidity: true,
      feeTier: true,
      id: true,
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

  @Interval(1000 * 60 * 10)
  async getHello() {
    try {
      let web3 = getWeb3WithProvider();
      const wallet = new Wallet(web3);

      let outOfRangePositions: any[] = [];

      const data: any = await subgraphRequest(SUBGRAPH_URI, params);

      const minTick = -887272;
      const maxTick = 887272;

      data?.unipilotPositions.forEach((position: any, idx) => {
        const threshold = 0;
        const liquidity = new BigNumber(
          wallet.toEth(position?.pool?.liquidity),
        );

        const tickInRange =
          parseFloat(position?.pool?.tick) > minTick &&
          parseFloat(position?.pool?.tick) < maxTick;

        if (liquidity.toNumber() > threshold && tickInRange) {
          outOfRangePositions.push({
            poolAddress: position?.pool?.id,
            token0Address: position?.pool?.token0?.id,
            token1Address: position?.pool?.token1?.id,
            feeTier: position?.pool?.feeTier,
          });
        }
      });

      wallet.importWallet(process.env.PRIVATE_KEY);

      const shouldReadjust = await shouldReAdjustAll(
        outOfRangePositions.map((p) => p.poolAddress),
      );
      const readjustFrequencyStatus = await readjustFrequencyStatusAll(
        outOfRangePositions.map((p) => p.poolAddress),
      );

      let txCount = await wallet.getTransectionCount();

      let allowedToRebase = [];

      outOfRangePositions.forEach((position, idx) => {
        if (shouldReadjust[idx] && !readjustFrequencyStatus[idx])
          allowedToRebase.push(position);
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
      const chainId = 4;
      const _reAdjust = reAdjust({
        token0: positions[idx]?.token0Address,
        token1: positions[idx]?.token1Address,
        feeTier: positions[idx]?.feeTier,
      });

      const gas = await wallet.getEstimatedGas(
        wallet.getTxObject({
          to: CONTRACT_ADDRESSES.LiquidityManager,
          data: _reAdjust,
          nonce: txCount,
          chainId: '0x' + wallet.convertToHex(chainId),
        }),
      );

      const txObject = wallet.getTxObject({
        to: CONTRACT_ADDRESSES.LiquidityManager,
        data: _reAdjust,
        nonce: txCount,
        gas: parseInt(gas).toString(),
        gasLimit: '1529678',
        maxFeePerGas: '250000000000',
      });

      const txSigned = await wallet.getSignedTx(txObject);
      const tx = await wallet.sendSignedTx(txSigned);

      console.log('TX Info => ', {
        nonce: txCount,
        tx: `${URL_ETHERSCAN}${tx?.transactionHash}`,
        from: wallet.wallets[0].address,
        cumulativeGasUsed: tx?.cumulativeGasUsed,
        effectiveGasPrice: `${parseInt(
          wallet.toGWei(tx?.effectiveGasPrice),
        )} GWei`,
      });
      this.rebase({ wallet, positions, txCount: txCount + 1, idx: idx + 1 });
    } catch (e) {
      this.rebase({ wallet, positions, txCount: txCount, idx: idx + 1 });
    }
  }
}
