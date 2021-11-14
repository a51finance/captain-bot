import uniStateABI from '../abis/UniState.json';
import multiCallABI from '../abis/MulticallAbi.json';

import { getWeb3WithProvider } from '../common';
import { CONTRACT_ADDRESSES } from 'src/constants';
import Multicaller from './multiCall';
import { UniState } from '../types/UniState';

export const shouldReAdjustAll = async (pools): Promise<any> => {
  try {
    const multiCall = new Multicaller(
      CONTRACT_ADDRESSES.uniState,
      CONTRACT_ADDRESSES.multiCall,
      uniStateABI,
      multiCallABI,
      getWeb3WithProvider(),
    );

    pools.forEach((pool, idx) => {
      multiCall.call([
        ['bool'],
        CONTRACT_ADDRESSES.uniState,
        'shouldReadjust',
        [pool, CONTRACT_ADDRESSES.LiquidityManager],
      ]);
    });

    const results = await multiCall.execute();

    return results?.map((r) => r['0']);
  } catch (e) {
    return [];
  }
};

export const shouldReAdjustFunc = async (pool: string): Promise<Boolean> => {
  try {
    const instance = getWeb3WithProvider();

    const ulmState: UniState = new instance.eth.Contract(
      uniStateABI,
      CONTRACT_ADDRESSES.uniState,
    );

    const result = await ulmState.methods
      .shouldReadjust(pool, CONTRACT_ADDRESSES.LiquidityManager)
      .call();

    return result;
  } catch (e) {
    return false;
  }
};
