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
    console.log('approve', e);
    return '';
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
    console.log('readjustFrequencyStatus', e);
    return [];
  }
};
