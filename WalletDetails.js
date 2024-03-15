import { React, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CryptoStore from './MobXStore'
import { observer } from 'mobx-react-lite';
import SendTransactionPolygon from './Wallet/MakePolygonTransaction'

const WalletDetails = observer(({ handleTransactionMade }) => {
    const [currentUI, setCurrentUI] = useState("details");
  const addressArray = CryptoStore.chain === 'bitcoin' ? CryptoStore.btcAddress : CryptoStore.polygonAddress;
  console.log(addressArray);

  const publicAddress = addressArray?.[1]; 

  const formatAddress = (address) => {
    if (typeof address === 'string') {
      return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
    }
    return 'Address not available'; 
  };

  return (
    <View style={styles.card}>
      <Image source={require("./assets/profile.png")} style={styles.image} />
      <Text style={styles.title}>Wallet Details</Text>
      <Text style={styles.text}>Address: {formatAddress(publicAddress)}</Text>
      <TouchableOpacity style={styles.button} onPress={handleTransactionMade}>
        <Text style={styles.buttonText}>Make Transaction</Text>
      </TouchableOpacity>
      {currentUI === "sendBitcoin" && (
        <SendBitcoinUI backToDetails={() => setCurrentUI("details")} />
      )}

      {currentUI === "sendPolygon" && (
        <SendPolygonUI backToDetails={() => setCurrentUI("details")} />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  image: {
    width: 100, 
    height: 100, 
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default WalletDetails;
