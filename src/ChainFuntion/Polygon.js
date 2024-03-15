import { ethers } from 'ethers'

const calculatePublicKey = (privateKey) => {
    const etherWallet = new ethers.Wallet(privateKey);
    return etherWallet.address
}
const transferFunds = () => { }

export default {
    calculatePublicKey,
    transferFunds
}