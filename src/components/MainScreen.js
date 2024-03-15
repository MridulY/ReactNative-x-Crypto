import React, { useState, useEffect, useRef } from 'react'
import { Button, StyleSheet, Text, View, Animated, ImageBackground } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import axios from 'axios'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { LinearGradient } from 'expo-linear-gradient';

import BTCWalletsStore from '../mobx_store/BTCWallet'
import PolygonWalletsStore from '../mobx_store/PolygonWallet'
import operativeWalletStore from '../mobx_store/OperativeWallet'
import currentUsingChain from '../mobx_store/CurrentChain'
import BitCoinImage from '../../assets/bitcoin-icon.png'

import Polygon from '../ChainFuntion/Polygon'

const HomeScreen = ({ navigation }) => {
    const [wallets, setWallets] = useState([])
    const [text, setText] = useState()
    const [bitcoinPrice, setBitcoinPrice] = useState()
    const [usdtprice, setusdtPrice] = useState()

    const [chain, setChain] = useState('Bitcoin')
    const [animation, setAnimation] = useState(new Animated.Value(0));

    useEffect(() => {
        if (currentUsingChain.chain === 'Bitcoin') {
            setWallets(BTCWalletsStore.wallets)
        } else if (currentUsingChain.chain === 'Polygon') {
            setWallets(PolygonWalletsStore.wallets)
        }
        async function setAssetPrices() {
            console.log('inside useState...')
            const url =
                'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,tether&vs_currencies=usd&markets=global,polygon-mainnet'
            const price = await axios.get(url)
            console.log(price.data)
            console.log('price.data.bitcoin.usd', price.data.bitcoin.usd)
            setBitcoinPrice(price.data.bitcoin.usd)
            setusdtPrice(price.data.tether.usd)
        }
        
        setAssetPrices()
    }, [currentUsingChain.chain])

    const backgroundColor = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(255, 99, 71, 0.8)', 'rgba(70, 130, 180, 0.8)'], 
    });

    function handleChainChange(chain) {
        currentUsingChain.setChain(chain)
        setChain(chain)
        Animated.timing(animation, {
            toValue: chain === 'Bitcoin' ? 0 : 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
        console.log('currentUsingChain', chain)
    }

    function trimWalletAddress(account) {
        console.log('account', account)
        return account.slice(0, 6) + '...' + account.slice(-4)
    }

    const handleWalletClick = (wallet) => {
        // const account = calculatePublicKey(wallet.privateKey)
        operativeWalletStore.changeCurrentActiveAccount(
            currentUsingChain.chain,
            wallet.wallet,
            wallet.account,
            wallet.privateKey
        )
        console.log('active wallet is ', operativeWalletStore.wallet)
        navigation.navigate('Wallet')
    }

    const PriceCard = ({ name, price, iconName }) => {
        return (
            <LinearGradient
                colors={['#6a11cb', '#2575fc']} // Attractive gradient colors
                style={styles.priceCard}
            >
                <Icon name={iconName} size={30} color="#FFF" />
                <Text style={styles.priceCardText}>{name}</Text>
                <Text style={styles.priceCardPrice}>${price}</Text>
            </LinearGradient>
        );
    };

    const BackgroundColor = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['#FFFFFF', '#F0F0F0'],
    });

    const scale = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.1],
    });

    return (
        <LinearGradient
            colors={['#0072ff', '#00c6ff']} 
            style={styles.container}
        >
            <LinearGradient
                colors={['#6a11cb', '#2575fc']} 
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.notch_container}
            >
                <Animated.View style={{ flex: 1, transform: [{ scale: chain === 'Bitcoin' ? scale : 1 }], marginHorizontal: 10 }}>
                    <TouchableOpacity onPress={() => handleChainChange('Bitcoin')}>
                        <LinearGradient colors={['#F8F8F8', '#E0E0F0']} style={styles.buttonGradient}>
                            <Text style={[styles.indicatorText, chain === 'Bitcoin' ? styles.selectedChain : styles.unselectedChain]}>
                                Bitcoin
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
                <Animated.View style={{ flex: 1, transform: [{ scale: chain === 'Polygon' ? scale : 1 }], marginHorizontal: 10 }}>
                    <TouchableOpacity onPress={() => handleChainChange('Polygon')}>
                        <LinearGradient colors={['#F8F8F8', '#E0E0F0']} style={styles.buttonGradient}>
                            <Text style={[styles.indicatorText, chain === 'Polygon' ? styles.selectedChain : styles.unselectedChain]}>
                                Polygon
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </LinearGradient>
            <View style={styles.container2}>
                <LinearGradient
                    colors={['#4c669f', '#3b5998', '#192f6a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                >
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate('ImportScreen');
                            console.log('Import clicked');
                        }}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>Import</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
            {currentUsingChain.chain === 'Bitcoin' && (
                <PriceCard
                    name="Bitcoin"
                    price={bitcoinPrice ? bitcoinPrice : 0}
                    iconName="bitcoin"
                />
            )}
            <PriceCard
                name="USDT"
                price={usdtprice || 0}
                iconName="currency-usd"
            />
            <Text>{text}</Text>
            <View style={styles.horizontalLine}></View>
            <View style={styles.walletContainer}>
                {wallets.map((wallet, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => handleWalletClick(wallet)}
                        style={styles.walletItem}
                    >
                        <Text>{wallet.wallet}</Text>
                        <Text>{trimWalletAddress(wallet.account)}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </LinearGradient>
    );
}

export default HomeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 25,
    },
    priceCard: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 20,
        marginVertical: 10,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    priceCardText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    priceCardPrice: {
        color: '#FFF',
        fontSize: 16,
    },
    iconStyle: {
        width: 20, 
        height: 20, 
        marginRight: 8, 
    },
    buttonGradient: {
        paddingVertical: 10, 
        paddingHorizontal: 20, 
        borderRadius: 25, 
        width: '100%', 
    },
    buttonGradient1: {
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%', 
        borderRadius: 25, 
    },
    buttonText: {
        color: '#ffffff', 
        fontSize: 16,
        fontWeight: 'bold', 
    },
    notch_container: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        padding: 10,
        elevation: 2,
        marginTop: 50,
        height: 100,
        borderRadius: 20,
    },
    indicatorText: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    selectedChain: {
        color: 'black',
        textDecorationLine: 'underline',
    },
    unselectedChain: {
        color: 'grey',
    },
    container1: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignContent: 'center',
    },
    txt: {
        fontSize: 20,
        backgroundColor: 'white',
        margin: 10,
        opacity: 0.5,
    },
    horizontalElement: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.5)', 
    },
    horizontalText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
        color: '#000'
    },
    horizontalPrice: {
        fontSize: 16,
        color: '#333',
    },
    container2: {
        flexDirection: 'row',
        justifyContent: 'center', 
        alignItems: 'center', 
        margin: 20,
        marginTop: 50, 
        width: '80%',
        alignSelf: 'center', 
        padding: 12,
        borderRadius: 25, 
        backgroundColor: 'transparent', 
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    horizontalLine: {
        width: '100%',
        height: 1,
        backgroundColor: 'grey',
        marginVertical: 20
    },
    walletItem: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#FFF', 
        borderRadius: 10, 
        elevation: 5, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
})