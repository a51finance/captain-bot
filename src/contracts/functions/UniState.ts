import uniStateABI from '../abis/UniState.json';
import multiCallABI from '../abis/MulticallAbi.json';

import { getWeb3WithProvider } from '../common';
import { CONTRACT_ADDRESSES } from 'src/constants';
import Multicaller from './multiCall';

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
