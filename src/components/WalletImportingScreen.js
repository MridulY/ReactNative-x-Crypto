import React, { useState } from 'react'
import { View, TextInput, Text, Button, StyleSheet, ActivityIndicator } from 'react-native'
import axios from 'axios'

import BTCWalletsStore from '../mobx_store/BTCWallet'
import PolygonWalletsStore from '../mobx_store/PolygonWallet'
import currentUsingChain from '../mobx_store/CurrentChain'
import { Ionicons } from '@expo/vector-icons'
import bitcoin from 'bitcoinjs-lib';

import Error1 from './Error'
import Progress from './Progress'
import { LinearGradient } from 'expo-linear-gradient';


import Polygon from '../ChainFuntion/Polygon'

const SERVER_URL = 'https://cryptoxpress-back.onrender.com'

const ImportScreen = ({ navigation }) => {
    const [walletName, setWalletName] = useState('')
    const [privateKey, setPrivateKey] = useState('')
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState(null)

    function checkPrivateKey(privateKey) {
        console.log(currentUsingChain.chain, privateKey.length)
        if (currentUsingChain.chain === "Bitcoin" && privateKey.length === 52) {
            return true
        } else if (currentUsingChain.chain === "Polygon" && privateKey.length === 64) {
            return true
        }
        else return false
    }

    async function calculatePublicKey(privateKey) {
        if (currentUsingChain.chain === 'Polygon') {
            return Polygon.calculatePublicKey(privateKey)
        }else if (currentUsingChain.chain === 'Bitcoin'){
            const network = bitcoin.networks.testnet; 

            try {
                const keyPair = bitcoin.ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'), { network });
                const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network });
                return address;
            } catch (error) {
                console.error('Error:', error);
                return null;
            }
        }
    }

    const handleImport = async () => {
        console.log('Import button pressed')
        if (!checkPrivateKey(privateKey)) {
            setErrorMessage(`Invalid private key for ${currentUsingChain.chain} network`);
            return;
        }
        setLoading(true)
        const account = await calculatePublicKey(privateKey)
        if (currentUsingChain.chain === 'Bitcoin') {
            BTCWalletsStore.addBitcoinWallet(walletName, privateKey, account)
        } else if (currentUsingChain.chain === 'Polygon') {
            PolygonWalletsStore.addPolygonWallet(walletName, privateKey, account)
        }
        console.log('Wallet added successfully')
        navigation.goBack()
    }

    const handleCancel = () => {
        console.log('Cancel button pressed')
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Import Your {currentUsingChain.chain} Wallet</Text>
            <View style={styles.inputContainer}>
                <Ionicons name="wallet-outline" size={24} color="#666" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder='Wallet Name'
                    value={walletName}
                    onChangeText={setWalletName}
                />
            </View>

            <View style={styles.inputContainer}>
                <Ionicons name="key-outline" size={24} color="#666" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder='Private Key'
                    value={privateKey}
                    onChangeText={setPrivateKey}
                    secureTextEntry={true}
                />
            </View>

            <View style={styles.buttonContainer}>
                <Button title='Import' onPress={handleImport} color="#4CAF50" />
                <Button
                    title='Cancel'
                    onPress={() => navigation.navigate('Home')}
                    color="#F44336"
                />
            </View>
            {loading && <Progress message={'Importing Your Wallet'} />} 
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heading: {
        fontWeight: 'bold',
        textDecorationLine: 'underline',
        marginBottom: 10,
        alignSelf: 'center',
    },
    input: {
        width: '80%',
        height: 40,
        borderWidth: 1,
        borderColor: 'gray',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '80%',
    },
})

export default ImportScreen