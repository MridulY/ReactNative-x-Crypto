import { makeAutoObservable, observable, action } from "mobx";
import axios from "axios";
class CryptoStore {
  bitcoinValue = null;
  usdtValue = null;
  btcAddress = [];
  polygonAddress = [];
  chain = 'bitcoin';
  currentwallet = {};


  constructor() {
    makeAutoObservable(this,{
      btcAddress: observable,
      polygonAddress: observable,
      currentwallet: observable,
      chain: observable,
      addBitcoinWallet: action,
      addPolygonWallet: action,
      setWalletType: action,
      changeCurrentActiveAccount: action
    });
  }

  fetchBitcoinValue = async () => {
    const response = await axios('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    
    this.setBitcoinValue(response.data.bitcoin.usd);
  };

  fetchUsdtValue = async () => {
    const data = await axios('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd');
    
    this.setUsdtValue(data.data.tether.usd);
  };

  setWalletType(type) {
    this.chain = type;
  }

  setWalletAddress(address) {
    this.walletAddress = address;
  }

  addBitcoinWallet(privateKey, address){
    this.btcAddress.push(privateKey, address)
  }

  addPolygonWallet(privateKey, address){
    this.polygonAddress.push(privateKey, address)
  }

  changeCurrentActiveAccount(chain, wallet, account, privateKey) {
    this.currentwallet = { chain, wallet, account, privateKey };
  }

  setBitcoinValue = (value) => {
    this.bitcoinValue = value;
  };

  setUsdtValue = (value) => {
    this.usdtValue = value;
  };
}

export default new CryptoStore();
