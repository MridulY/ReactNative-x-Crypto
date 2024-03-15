import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import * as bitcoin from 'bitcoinjs-lib';
import Progress from './src/components/Progress'
import "@ethersproject/shims"
import { ethers } from 'ethers'
import CryptoStore from './MobXStore'

const ImportWallet = ({ onAddressDerived }) => {
    const [privateKey, setPrivateKey] = useState('');
    const [walletType, setWalletType] = useState('bitcoin');
    const [loading, setLoading] = useState(false)
    const [chain, setChain] = useState('Bitcoin')
    const [wallets, setWallets] = useState([])

    useEffect(() => {
        if (CryptoStore.chain === 'Bitcoin') {
            setWallets(CryptoStore.btcAddress)
        } else if (CryptoStore.chain === 'Polygon') {
            setWallets(CryptoStore.polygonAddress)
        }
    }, [CryptoStore.chain])

    function handleChainChange(chain) {
        CryptoStore.setWalletType(chain)
        setChain(chain)
        console.log('currentUsingChain', chain)
    }

    const handleWalletClick = (wallet) => {
        CryptoStore.changeCurrentActiveAccount(
            currentUsingChain.chain,
            wallet.wallet,
            wallet.account,
            wallet.privateKey
        )
        console.log('active wallet is ', operativeWalletStore.wallet)
    }

    const importWallet = () => {
        try {
            console.log('inside import function');
            let address;

            setLoading(true)
            if (walletType === 'bitcoin') {
                const keyPair = bitcoin.ECPair.fromWIF(privateKey, bitcoin.networks.testnet);
                const { address: btcAddress } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: bitcoin.networks.testnet });
                address = btcAddress;
                CryptoStore.addBitcoinWallet(privateKey, address)
                console.log(CryptoStore.btcAddress);
            } else if (walletType === 'polygon') {
                const wallet = new ethers.Wallet(privateKey);
                address = wallet.address;
                CryptoStore.addPolygonWallet(privateKey, address)
            }

            console.log('Wallet Imported', address);
            onAddressDerived(address);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Invalid private key.");
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
             <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={[styles.walletButton, walletType === 'bitcoin' ? styles.buttonActive : styles.buttonInactive]}
                    onPress={() => {handleChainChange('bitcoin'); setWalletType('bitcoin'); CryptoStore.setWalletType('bitcoin');}}
                >
                    <Text style={styles.buttonText}>Bitcoin</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.walletButton, walletType === 'polygon' ? styles.buttonActive : styles.buttonInactive]}
                    onPress={() => {handleChainChange('polygon'); setWalletType('polygon'); CryptoStore.setWalletType('polygon');}}
                >
                    <Text style={styles.buttonText}>Polygon</Text>
                </TouchableOpacity>
            </View>
            <TextInput
                style={styles.input}
                placeholder="Enter your private key"
                value={privateKey}
                onChangeText={setPrivateKey}
                autoCapitalize="none"
                secureTextEntry={true}
            />
            <Button title="Import Wallet" onPress={importWallet} style={styles.importButton}/>
            {loading && <Progress message={'Importing Your Wallet'} />} 
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: 'gray',
        marginBottom: 10,
        paddingHorizontal: 10,
        height: 40,
        borderRadius: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    walletButton: {
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#6200ee',
    },
    importButton: {
        backgroundColor: '#6200ee',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonActive: {
        backgroundColor: '#6200ee',
    },
    buttonInactive: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default ImportWallet;
