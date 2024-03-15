import {
    Button,
    StyleSheet,
    Text,
    View,
    FlatList,
    Image,
    TouchableOpacity,
} from 'react-native'
import React, { useState, useEffect } from 'react'
import axios from 'axios'

import operativeWalletStore from '../mobx_store/OperativeWallet'
import currentUsingChain from '../mobx_store/CurrentChain'
import { LinearGradient } from 'expo-linear-gradient';


import { transaction } from 'mobx'

const Wallet = ({ navigation }) => {
    const [transactions, setTransactions] = useState([])

    useEffect(() => {
        console.log('inside useEffect')
        const fetchBitcoinTransactions = async () => {
            try {
                console.log('inside fetchTransactions')
                const response = await axios.get(
                    `https://rest.cryptoapis.io/blockchain-data/bitcoin/testnet/addresses/${operativeWalletStore.wallet.account}/transactions`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-API-Key':
                                'c12b72ff5ef0834a1342ce144a0250c38afd95f3',
                        },
                    }
                )
                setTransactions(response.data.data.items)
            } catch (error) {
                console.error('Error fetching transactions:', error)
            }
        }
        const fetchPolygonTransactions = async () => {

            console.log('activewallet is 🐶🐶🐶🐶🐶🐶🐶🐶🐶', operativeWalletStore.wallet.account)
            let data = JSON.stringify({
                jsonrpc: '2.0',
                id: 0,
                method: 'alchemy_getAssetTransfers',
                params: [
                    {
                        fromBlock: '0x0',
                        fromAddress: operativeWalletStore.wallet.account,
                        category: ['external'],
                    },
                ],
            })
            console.log(data);

            var requestOptions = {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                data: data,
            }

            const apiKey = 'PNl9AZYCiqIBxCsuNNz496pR5EJ521fA'
            const baseURL = `https://polygon-mumbai.g.alchemy.com/v2/${apiKey}`
            const axiosURL = `${baseURL}`

            axios(axiosURL, requestOptions)
                .then((response) => {

                    console.log(response.data.result.transfers.reverse())
                    setTransactions(response.data.result.transfers.reverse())
                })
                .catch((error) => console.log(error))
        }

        if (currentUsingChain.chain === 'Bitcoin') {
            fetchBitcoinTransactions()
        } else if (currentUsingChain.chain === 'Polygon') {
            fetchPolygonTransactions()
        }
    }, [])

    function handleTransactionPress(transaction) {
        if (currentUsingChain.chain === "Bitcoin") {
            navigation.navigate('BitcoinTransactionDetails', { transaction })
        }
        else if (currentUsingChain.chain === "Polygon") {
            navigation.navigate('PolygonTransactionDetails', { transaction })
        }
    }

    function trimWalletAddress() {
        return (
            operativeWalletStore.wallet.account.slice(0, 6) +
            '...' +
            operativeWalletStore.wallet.account.slice(-4)
        )
    }

    return (
        <View style={styles.walletContainer}>
            <LinearGradient colors={['#120318', '#221a36']} style={styles.profileContainer}>
                <Image
                    source={require('../../assets/profile.png')}
                    style={styles.profileImage}
                />
                <Text style={styles.walletName}>{operativeWalletStore.wallet.wallet}</Text>
                <Text style={styles.walletAddress}>{trimWalletAddress()}</Text>
                <Text style={styles.currentChain}>Current Chain: {currentUsingChain.chain}</Text>
            </LinearGradient>
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('TransferFund')} style={styles.transferButton}>
                    <Text style={styles.transferButtonText}>Transfer Fund</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.transactionsTitle}>Transaction History</Text>
            <FlatList
                data={transactions}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.transactionItem} onPress={() => handleTransactionPress(item)}>
                        {/* Transaction details */}
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item.transactionId}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    walletContainer: {
        flex: 1,
        backgroundColor: '#0D0221',
    },
    profileContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#221a36',
        marginTop: 20
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    walletName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    walletAddress: {
        fontSize: 14,
        color: '#A9A9A9',
    },
    currentChain: {
        fontSize: 14,
        color: '#DDDDDD',
        marginTop: 5,
    },
    transactionsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginLeft: 10,
        marginTop: 20,
        marginBottom: 10,
    },
    transactionItem: {
        backgroundColor: '#221a36',
        padding: 15,
        borderRadius: 8,
        marginHorizontal: 10,
        marginBottom: 10,
    },
    transactionLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#CCCCCC',
    },
    transactionValue: {
        fontSize: 14,
        color: '#E0E0E0',
    },
    buttonContainer: {
        marginTop: 20,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    transferButton: {
        backgroundColor: '#6C63FF',
        borderRadius: 5,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transferButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
});


export default Wallet
