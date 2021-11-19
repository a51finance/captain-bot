import { getContract, getWeb3WithProvider } from '../common';
import multiCallABI from '../abis/MulticallAbi.json';
import { CONTRACT_ADDRESSES } from 'src/constants';

export const aggregate = async ({
  pools,
  methods,
  target,
  funcName,
}: {
  pools: string[];
  methods: any;
  target: string;
  funcName: string;
}): Promise<any[]> => {
  try {
    const calls = pools.map((pool) => ({
      target,
      callData: methods[funcName](pool).encodeABI(),
    }));
    const web3 = getWeb3WithProvider();
    const multiCall = getContract(multiCallABI, CONTRACT_ADDRESSES.multiCall);
    const results = await multiCall.methods.aggregate(calls).call();
    console.log(results);
    const decoded = results.returnData.map((data) => {
      return web3.eth.abi.decodeParameter('bool', data);
    });
    console.log(decoded);

    return decoded;
  } catch (e) {
    console.log('Multicall', e);
    return [];
  }
};

export default class Multicaller {
  public web3: any;
  public calls: any[] = [];
  public instance: any;
  public multiCall: any;
  public decodeParam: any[] = [];

  constructor(
    contractAddress: string,
    multicallAddress: string,
    contractABI: any[],
    multicallABI: any[],
    web3: any,
  ) {
    this.web3 = web3;
    this.instance = new web3.eth.Contract(contractABI, contractAddress);
    this.multiCall = new web3.eth.Contract(multicallABI, multicallAddress);
  }

  call(configs): Multicaller {
    this.decodeParam.push(configs[0]);
    this.calls.push([
      configs[1],
      this.instance.methods[configs[2]](...configs[3]).encodeABI(),
    ]);
    return this;
  }

  async execute(): Promise<any> {
    const result = await this.multiCall.methods.aggregate(this.calls).call();
    const decoded = result?.returnData.map((param, i) => {
      return this.web3.eth.abi.decodeParameters(this.decodeParam[i], param);
    });
    this.calls = [];
    this.decodeParam = [];
    return decoded;
  }
}
