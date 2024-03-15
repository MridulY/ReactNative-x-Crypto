import React, { useState, useEffect } from 'react'
import { ethers, JsonRpcProvider } from 'ethers'
import axios from 'axios'
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Image,
    TouchableOpacity,
} from 'react-native'

import operativeWalletStore from '../mobx_store/OperativeWallet'
import currentUsingChain from '../mobx_store/CurrentChain'
import Error1 from './Error'
import Progress from './Progress'

const SERVER_URL = 'https://cryptoxpress-back.onrender.com'

const TransferFund = ({ navigation }) => {
    const [receiverAddress, setReceiverAddress] = useState('')
    const [amount, setAmount] = useState('')
    const [userBalance, setUserBalance] = useState(0)
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchBalances = async () => {
            console.log('👍')
            if (currentUsingChain.chain === 'Bitcoin') {
                console.log('👍👍')
                await fetchBitcoinBalance()
            } else if (currentUsingChain.chain === 'Polygon') {
                await fetchPolygonBalance()
            }
        }
        fetchBalances()
    }, [])

    const fetchPolygonBalance = async () => {
        const provider = new ethers.providers.JsonRpcProvider(
            'https://polygon-mainnet.g.alchemy.com/v2/PNl9AZYCiqIBxCsuNNz496pR5EJ521fA'
        )
        const address = operativeWalletStore.wallet.account
        const balance = await provider.getBalance(address)
        setUserBalance(ethers.utils.formatEther(balance))
        console.log(balance)
    }

    const fetchBitcoinBalance = async () => {
        console.log('👍👍👍')
        console.log(operativeWalletStore.wallet.account)
        const response = await axios({
            baseURL: `https://rest.cryptoapis.io/blockchain-data/bitcoin/testnet/addresses/${operativeWalletStore.wallet.account}/transactions`,
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': 'c12b72ff5ef0834a1342ce144a0250c38afd95f3',
            },
        })

        let totalAmountAvailable = 0
        let utxos = response.data.data.items

        for (const element of utxos) {
            totalAmountAvailable += Math.floor(
                parseFloat(element.blockchainSpecific.vout[0].value) * 100000000
            )
        }
        setUserBalance(totalAmountAvailable / 10 ** 8)
    }

    function trimWalletAddress() {
        return (
            operativeWalletStore.wallet.account.slice(0, 6) +
            '...' +
            operativeWalletStore.wallet.account.slice(-6)
        )
    }

    async function transferBitcoins() {
        console.log(receiverAddress.length)
        if (receiverAddress.length !== 34) {
            alert('Invalid bitcoin address')
        }
        const response = await axios.post(
            `${SERVER_URL}/transferBitcoin`,
            {
                data: {
                    sender: operativeWalletStore.wallet.account,
                    receiver: receiverAddress,
                    amount: amount,
                    privateKey: operativeWalletStore.wallet.privateKey,
                },
            }
        )
        console.log('😎😎', response.data)
        console.log('transaction completed')
        if (response.data.code === 0) {
           return <Error1 message={"Some error occured"}/>
        } else if (response.data.code === 1) {
            navigation.navigate('Success', { transactionId: response.data.result.tx.hash })
        }
    }

    async function transferPolygon() {
        try {
            if (receiverAddress.length !== 42) {
                alert('Invalid polygon address')
            }
            console.log(`Sending ${amount} polygon to ${receiverAddress}`)

            const privateKey = operativeWalletStore.wallet.privateKey
            const address = operativeWalletStore.wallet.account

            const provider = new ethers.providers.JsonRpcProvider(
                'https://polygon-mumbai.g.alchemy.com/v2/2sNa9TgLKPsPhrveTuT7JRb9GgZTbboc'
            )
            const signer = new ethers.Wallet(privateKey, provider)

            if (amount > userBalance) {
                alert('insufficient funds')
                return
            }

            const tx = await signer.sendTransaction({
                to: receiverAddress,
                value: ethers.utils.parseEther(amount),
            })
            await tx.wait()

            const transactionId = tx.hash
            console.log(`Transaction ID: ${transactionId}`)
            console.log('polygon trasaction complete')
            navigation.navigate('Success', { transactionId })
        } catch (error) {
            console.log(error)
            alert('Something went wrong!! transaction failed')
        }
    }

    const handleSend = async () => {
        setIsProcessing(true); 
        try {
            console.log('send button pressed');
            if (currentUsingChain.chain === 'Bitcoin') {
                await transferBitcoins();
            } else if (currentUsingChain.chain === 'Polygon') {
                await transferPolygon();
            }
            console.log(`Sending ${amount} to ${receiverAddress}`);
        } catch (error) {
            console.error('Transaction Error:', error);
            alert('Something went wrong!');
        } finally {
            setIsProcessing(false); 
        }
    }

    if (isProcessing) {
        return <Progress message={'Hold On We Are Processing Your Transaction'}/>; 
    }

    return (
        <View style={{ marginTop: 100 }}>
            <View style={styles.profileContainer}>
                <Image
                    source={require('../../assets/profile.png')}
                    style={styles.profileImage}
                />
                <Text style={styles.walletName}>
                    {operativeWalletStore.wallet.wallet}
                </Text>
                <Text style={styles.walletAddress}>{trimWalletAddress()}</Text>
                <Text style={styles.currentChain}>
                    Selected Chain: {currentUsingChain.chain}
                </Text>
                <Text style={styles.currentChain}>
                    Wallet Balance: {userBalance}
                </Text>
            </View>
            <View style={styles.container}>
                <View style={styles.bottomContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder='Enter Recievers Public Address '
                        value={receiverAddress}
                        onChangeText={setReceiverAddress}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder='Enter Amount'
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType='numeric'
                    />
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleSend}
                    >
                        <Text style={styles.buttonText}>Send</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 20,
        backgroundColor: '#F5F5F7', 
    },
    profileContainer: {
        alignItems: 'center',
        marginBottom: 30,
        marginLeft: 19,
        backgroundColor: '#FFFFFF',
        width: '90%',
        borderRadius: 10,
        paddingVertical: 20,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 4,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40, 
        marginBottom: 10,
    },
    walletName: {
        fontSize: 18,
        color: '#333333', 
        fontWeight: '500',
    },
    walletAddress: {
        fontSize: 14,
        color: '#666666', 
    },
    currentChain: {
        fontSize: 14,
        color: '#333333', 
        marginTop: 5,
    },
    bottomContainer: {
        width: '90%',
        marginTop: 10,
    },
    input: {
        height: 50,
        borderRadius: 5, 
        borderWidth: 1,
        borderColor: '#DADADA', 
        marginBottom: 20,
        paddingHorizontal: 20,
        color: '#333333', 
        backgroundColor: '#FFFFFF', 
        fontSize: 16,
    },
    button: {
        backgroundColor: '#25CCF7',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        height: 50,
    },
    buttonText: {
        color: '#000000', 
        fontSize: 16,
        fontWeight: 'bold',
    },
});


export default TransferFund