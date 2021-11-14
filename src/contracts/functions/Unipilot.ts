import liquidityManagerABI from '../abis/LiquidityManager.json';
import multiCallABI from '../abis/MulticallAbi.json';

import { LiquidityManager } from '../types/LiquidityManager';

import { getContract, getWeb3WithProvider } from '../common';
import { CONTRACT_ADDRESSES } from 'src/constants';
import Multicaller from './multiCall';

export const reAdjust = ({ token0, token1, feeTier }: any) => {
  try {
    const contract: LiquidityManager = getContract(
      liquidityManagerABI,
      CONTRACT_ADDRESSES.LiquidityManager,
    );

    return contract?.methods
      ?.readjustLiquidity(token0, token1, feeTier)
      .encodeABI();
  } catch (e) {
    return '';
  }
};

export const reAdjustGasCalculate = ({
  token0,
  token1,
  feeTier,
  wAddr,
}: any) => {
  try {
    const contract: LiquidityManager = getContract(
      liquidityManagerABI,
      CONTRACT_ADDRESSES.LiquidityManager,
    );

    return contract?.methods
      ?.readjustLiquidity(token0, token1, feeTier)
      .estimateGas({ from: wAddr });
  } catch (e) {
    return 0;
  }
};

export const readjustFrequencyStatusAll = async (pools): Promise<any> => {
  try {
    const multiCall = new Multicaller(
      CONTRACT_ADDRESSES.LiquidityManager,
      CONTRACT_ADDRESSES.multiCall,
      liquidityManagerABI,
      multiCallABI,
      getWeb3WithProvider(),
    );

    pools.forEach((pool, idx) => {
      multiCall.call([
        ['bool'],
        CONTRACT_ADDRESSES.LiquidityManager,
        'readjustFrequencyStatus',
        [pool],
      ]);
    });

    const results = await multiCall.execute();
    return results?.map((r) => r['0']);
  } catch (e) {
    return [];
  }
};

export const readjustFrequencyStatusFunc = async (
  pool: string,
): Promise<Boolean> => {
  try {
    const instance = getWeb3WithProvider();

    const ulmUnipilot: LiquidityManager = new instance.eth.Contract(
      liquidityManagerABI,
      CONTRACT_ADDRESSES.LiquidityManager,
    );

    const result = await ulmUnipilot.methods
      .readjustFrequencyStatus(pool)
      .call();

    return result;
  } catch (e) {
    return false;
  }
};

interface IUpdatePositionTotalAmountsFunc {
  fee0: string;
  fee1: string;
  amount0: string;
  amount1: string;
}

export const updatePositionTotalAmountsFunc = async (
  pool: string,
): Promise<IUpdatePositionTotalAmountsFunc> => {
  try {
    const instance = getWeb3WithProvider();

    const ulmUnipilot: LiquidityManager = new instance.eth.Contract(
      liquidityManagerABI,
      CONTRACT_ADDRESSES.LiquidityManager,
    );

    const result = await ulmUnipilot.methods
      .updatePositionTotalAmounts(pool)
      .call();

    const { fee0, fee1, amount0, amount1 } = result;

    let filtered = {
      fee0,
      fee1,
      amount0,
      amount1,
    };

    return filtered;
  } catch (e) {
    return {
      fee0: '',
      fee1: '',
      amount0: '',
      amount1: '',
    };
  }
};

export const getPremiumStatusForPoolsFunc = async (
  pool: string,
): Promise<boolean> => {
  try {
    const instance = getWeb3WithProvider();

    const ulmUnipilot: LiquidityManager = new instance.eth.Contract(
      liquidityManagerABI,
      CONTRACT_ADDRESSES.LiquidityManager,
    );

    const result = await ulmUnipilot.methods
      .getPremiumStatusForPools(pool)
      .call();

    const { premiumForReadjust } = result;

    return premiumForReadjust;
  } catch (e) {
    return false;
  }
};
