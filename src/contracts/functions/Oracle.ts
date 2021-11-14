import OracleABI from '../abis/Oracle.json';
import { getWeb3WithProvider } from '../common';
import { CONTRACT_ADDRESSES } from 'src/constants';
import { Oracle } from '../types/Oracle';

interface ICheckPoolValidationFunc {
  token0: string;
  token1: string;
  amount0: string;
  amount1: string;
}

type func = (v: ICheckPoolValidationFunc) => Promise<Boolean>;

export const checkPoolValidationFunc: func = async ({
  token0,
  token1,
  amount0,
  amount1,
}) => {
  try {
    const instance = getWeb3WithProvider();

    const oracle: Oracle = new instance.eth.Contract(
      OracleABI,
      CONTRACT_ADDRESSES.oracle,
    );

    const result = await oracle.methods
      .checkPoolValidation(token0, token1, amount0, amount1)
      .call();

    return result;
  } catch (e) {
    return false;
  }
};
