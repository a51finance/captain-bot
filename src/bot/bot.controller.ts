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
        const threshold = 1000;
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

      outOfRangePositions.forEach(async (position, idx) => {
        shouldReadjust[idx] &&
          !readjustFrequencyStatus[idx] &&
          (await this.rebase({ wallet, position, txCount: txCount++ }));
      });
    } catch (e) {
      console.log('exception:Bot => ', e);
    }
  }

  async rebase({ wallet, position, txCount }: any) {
    try {
      const chainId = 4;
      const _reAdjust = reAdjust({
        token0: position?.token0Address,
        token1: position?.token1Address,
        feeTier: position?.feeTier,
      });

      const gasPrice = await wallet.getGasPrice();

      // for catching error
      const gas = await wallet.getEstimatedGas(
        wallet.getTxObject({
          to: CONTRACT_ADDRESSES.LiquidityManager,
          data: _reAdjust,
          nonce: txCount,
          chainId: '0x' + wallet.convertToHex(chainId),
        }),
      );
      // ---------

      const txObject = wallet.getTxObject({
        to: CONTRACT_ADDRESSES.LiquidityManager,
        data: _reAdjust,
        nonce: txCount,
        gas: 10000000,
        gasPrice,
      });

      const txSigned = await wallet.getSignedTx(txObject);
      const tx = await wallet.sendSignedTx(txSigned);

      console.log('TX Info => ', {
        nonce: txCount,
        tx: `${URL_ETHERSCAN}${tx?.transactionHash}`,
        from: wallet.wallets[0].address,
        cumulativeGasUsed: tx?.cumulativeGasUsed,
        effectiveGasPrice: `${parseInt(tx?.effectiveGasPrice)} GWei`,
      });
    } catch (e) {
      console.log(
        'TX Hash:Exception => ',
        `${URL_ETHERSCAN}${e?.receipt?.transactionHash}`,
        e?.message,
      );
    }
  }
}
