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

interface IUpdatePositionTotalAmountsFunc {
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

    const { amount0, amount1 } = result;

    let filtered = {
      amount0,
      amount1,
    };

    return filtered;
  } catch (e) {
    return {
      amount0: '',
      amount1: '',
    };
  }
};

export const getPoolPositionsFunc = async (pool: string): Promise<string> => {
  try {
    const instance = getWeb3WithProvider();

    const ulmUnipilot: LiquidityManager = new instance.eth.Contract(
      liquidityManagerABI,
      CONTRACT_ADDRESSES.LiquidityManager,
    );

    const result = await ulmUnipilot.methods.poolPositions(pool).call();

    return result[12];
  } catch (e) {
    return '0';
  }
};

export const shouldReAdjustFunc = async (
  pool: string,
  baseTickLower: string,
  baseTickUpper: string,
): Promise<Boolean> => {
  try {
    const instance = getWeb3WithProvider();

    const ulmUnipilot: LiquidityManager = new instance.eth.Contract(
      liquidityManagerABI,
      CONTRACT_ADDRESSES.LiquidityManager,
    );

    const result = await ulmUnipilot.methods
      .shouldReadjust(pool, baseTickLower, baseTickUpper)
      .call();

    return result;
  } catch (e) {
    return false;
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

// ================================================= MULTICALL

export const getOverAllStatus = async (pools: string[]): Promise<any> => {
  try {
    let isPremium = [];

    const multiCall = new Multicaller(
      CONTRACT_ADDRESSES.LiquidityManager,
      CONTRACT_ADDRESSES.multiCall,
      liquidityManagerABI,
      multiCallABI,
      getWeb3WithProvider(),
    );

    pools.forEach((pool, idx) => {
      multiCall.call([
        [
          { internalType: 'int24', name: 'baseTickLower', type: 'int24' },
          { internalType: 'int24', name: 'baseTickUpper', type: 'int24' },
          {
            internalType: 'uint128',
            name: 'baseLiquidity',
            type: 'uint128',
          },
          {
            internalType: 'int24',
            name: 'rangeTickLower',
            type: 'int24',
          },
          {
            internalType: 'int24',
            name: 'rangeTickUpper',
            type: 'int24',
          },
          {
            internalType: 'uint128',
            name: 'rangeLiquidity',
            type: 'uint128',
          },
          { internalType: 'uint256', name: 'fees0', type: 'uint256' },
          { internalType: 'uint256', name: 'fees1', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'feeGrowthGlobal0',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'feeGrowthGlobal1',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'totalLiquidity',
            type: 'uint256',
          },
          { internalType: 'bool', name: 'feesInPilot', type: 'bool' },
          { internalType: 'address', name: 'oracle0', type: 'address' },
          { internalType: 'address', name: 'oracle1', type: 'address' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          { internalType: 'uint8', name: 'counter', type: 'uint8' },
          { internalType: 'bool', name: 'status', type: 'bool' },
          { internalType: 'bool', name: 'managed', type: 'bool' },
        ],
        CONTRACT_ADDRESSES.LiquidityManager,
        'poolPositions',
        [pool],
      ]);
    });

    const results = await multiCall.execute();

    results.forEach((r, idx) => {
      const { managed, baseTickLower, baseTickUpper } = r;

      isPremium.push(managed);

      multiCall.call([
        ['bool'],
        CONTRACT_ADDRESSES.LiquidityManager,
        'shouldReadjust',
        [pools[idx], Number(baseTickLower), Number(baseTickUpper)],
      ]);
    });

    const r2 = await multiCall.execute();

    let shouldReadjust = r2?.map((r) => r['0']);

    // =========================== readjustFrequencyStatus
    pools.forEach((pool, idx) => {
      multiCall.call([
        ['bool'],
        CONTRACT_ADDRESSES.LiquidityManager,
        'readjustFrequencyStatus',
        [pool],
      ]);
    });

    const r3 = await multiCall.execute();
    let readjustFrequencyStatus = r3?.map((r) => r['0']);
    // ===================  readjustFrequencyStatus

    let combine = isPremium.map((iP, idx) => {
      return iP && shouldReadjust[idx] && !readjustFrequencyStatus[idx];
    });

    return combine;
  } catch (e) {
    return [];
  }
};

// ============================================== ENCODE ABI FUNC

export const getPoolPositionsFuncENCODE = (pool: string): string => {
  try {
    const instance = getWeb3WithProvider();

    const ulmUnipilot: LiquidityManager = new instance.eth.Contract(
      liquidityManagerABI,
      CONTRACT_ADDRESSES.LiquidityManager,
    );

    const result = ulmUnipilot.methods.poolPositions(pool).encodeABI();

    return result;
  } catch (e) {
    return '';
  }
};

export const shouldReAdjustFuncENCODE = (
  pool: string,
  baseTickLower: string,
  baseTickUpper: string,
): string => {
  try {
    const instance = getWeb3WithProvider();

    const ulmUnipilot: LiquidityManager = new instance.eth.Contract(
      liquidityManagerABI,
      CONTRACT_ADDRESSES.LiquidityManager,
    );

    const result = ulmUnipilot.methods
      .shouldReadjust(pool, baseTickLower, baseTickUpper)
      .encodeABI();

    return result;
  } catch (e) {
    return '';
  }
};

export const readjustFrequencyStatusFuncENCODE = (pool: string): string => {
  try {
    const instance = getWeb3WithProvider();

    const ulmUnipilot: LiquidityManager = new instance.eth.Contract(
      liquidityManagerABI,
      CONTRACT_ADDRESSES.LiquidityManager,
    );

    const result = ulmUnipilot.methods
      .readjustFrequencyStatus(pool)
      .encodeABI();

    return result;
  } catch (e) {
    return '';
  }
};
