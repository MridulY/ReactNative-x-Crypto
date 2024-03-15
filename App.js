import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View ,Image, Modal} from 'react-native';
import axios from 'axios';
import "./shim";
import { useEffect,useState } from 'react';
let bip39 = require('bip39')
let bip32 = require('bip32')
let bitcoin = require('bitcoinjs-lib')
import { Picker } from '@react-native-picker/picker';
import { observer } from 'mobx-react-lite';
import CryptoStore from './MobXStore'
import { reaction } from 'mobx';
import ImportWallet from './ImportWallets'
import WalletDetails from './WalletDetails';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import SendTransactionPolygon from './Wallet/MakePolygonTransaction'
import MakeTransaction from './Wallet/MakeBTCTransaction';
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Stack = createStackNavigator();

const App=observer(()=> {
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');
  const [walletAddress, setWalletAddress] = useState('');
  const [activeComponent, setActiveComponent] = useState('main');
  const [isTransactionModalVisible, setIsTransactionModalVisible] = useState(false);
  const [currentUI, setCurrentUI] = useState("details");

  const PriceCard = ({ name, price, iconName }) => {
    return (
      <LinearGradient
        colors={["#6a11cb", "#2575fc"]} 
        style={styles.priceCard}
      >
        <Icon name={iconName} size={30} color="#FFF" />
        <Text style={styles.priceCardText}>{name}</Text>
        <Text style={styles.priceCardPrice}>${price}</Text>
      </LinearGradient>
    );
  };


  const handleCloseTransactionModal = () => {
    setIsTransactionModalVisible(false);
  };
  const handleTransactionMade = () => {
    setIsTransactionModalVisible(true);
     if (CryptoStore.chain === "bitcoin") {
       setCurrentUI("sendBitcoin");
     } else if (CryptoStore.chain === "polygon") {
       setCurrentUI("sendPolygon");
     }
  };
  const handleAddressUpdate = (address) => {
    setWalletAddress(address);
  };
   const transactionComponent =
     CryptoStore.chain === "bitcoin" ? (
       <MakeTransaction onClose={handleCloseTransactionModal} />
     ) : (
       <SendTransactionPolygon onClose={handleCloseTransactionModal} />
     );
    

    const [usdt,setUsdt]=useState(null)
    const [bit,setBit]=useState(null)
    useEffect(() => {
      CryptoStore.fetchBitcoinValue();
      CryptoStore.fetchUsdtValue();
  
      const dispose1 = reaction(
        () => CryptoStore.bitcoinValue,
        (newValue, prevValue) => {
          setBit(newValue);
        }
      );
  
      const dispose2 = reaction(
        () => CryptoStore.usdtValue,
        (newValue, prevValue) => {
          setUsdt(newValue);
        }
      );
  
      
      return () => {
        dispose1();
        dispose2();
      };
    }, []);

  return (
    <View style={styles.container}>
      {walletAddress && (
        <WalletDetails handleTransactionMade={handleTransactionMade} />
      )}
      <Modal
        animationType="slide"
        transparent={false}
        visible={isTransactionModalVisible}
        onRequestClose={handleCloseTransactionModal}
      >
        {transactionComponent}
      </Modal>

      <View style={{ marginHorizontal: "20%" }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10%",
          }}
        >
          <PriceCard
            name="Bitcoin   "
            price={CryptoStore.bitcoinValue ? CryptoStore.bitcoinValue : 0}
            iconName="bitcoin"
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <PriceCard
            name="USDT    "
            price={CryptoStore.usdtValue || 0}
            iconName="currency-usd"
          />
        </View>
      </View>

      <View style={{ marginHorizontal: "10%", marginTop: "5%" }}>
        <Text style={{ fontSize: 15, marginLeft: "10%" }}>
          {" "}
          Select Wallet You Want To Import
        </Text>
      </View>
      {selectedCrypto === "bitcoin" ? (
        <ImportWallet onAddressDerived={handleAddressUpdate} />
      ) : (
        <ImportWallet />
      )}
    </View>
  );
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 60,
  },
  btcrate: {
    backgroundColor: "#25CCF7",
  },
  priceCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 20,
    marginVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  priceCardText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  priceCardPrice: {
    color: "#FFF",
    fontSize: 16,
  },
});
export default App;