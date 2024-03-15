import React, { useState } from "react";
import { ethers } from "ethers";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  Linking
} from "react-native";
import CryptoStore from '../MobXStore'

const SendTransactionPolygon = () => {
  const [receiverAddress, setReceiverAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState(null);
  const [showExplorerButton, setShowExplorerButton] = useState(false);

  const handleTransactionSuccess = (txId) => {
    setTransactionId(txId);
    setShowExplorerButton(true);
  };

  const handleGoToExplorer = () => {
    const explorerUrl = `https://mumbai.polygonscan.com/tx/${transactionId}`;
    Linking.openURL(explorerUrl).catch((err) =>
      console.error("Failed to open the URL:", err)
    );
  };

  const handleSend = async () => {
    try {
      const polygonTestnetRPC = "https://rpc-mumbai.maticvigil.com/";
      const privateKey = CryptoStore.polygonAddress[0]; 
      console.log('private key', privateKey);

      const provider = new ethers.providers.JsonRpcProvider(polygonTestnetRPC);
      console.log('provider',provider);
      const wallet = new ethers.Wallet(privateKey, provider);
      console.log('wallet ',wallet);
      const signer = wallet.connect(provider);
      console.log('signer ',signer);

      const amountInWei = ethers.utils.parseUnits(amount, "ether");
      console.log('amount', amountInWei);
      const tx = await signer.sendTransaction({
        to: receiverAddress,
        value: amountInWei,
        gasLimit: ethers.utils.parseUnits("21000", "wei"),
        gasPrice: ethers.utils.parseUnits("10", "gwei"),
      });
      console.log('transaction', tx);

      console.log("Transaction hash:", tx.hash);
      handleTransactionSuccess(tx.hash)
      Alert.alert("Transaction sent", `Hash: ${tx.hash}`);
    } catch (error) {
      console.error("Transaction error:", error);
      Alert.alert("Transaction error", error.message);
    }
  };
  const operativeWalletStore = {
    wallet: {
      wallet: "Wallet",
      address: CryptoStore.polygonAddress[1], 
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={require("../assets/profile.png")}
          style={styles.profileImage}
        />
        <Text style={styles.walletName}>
          {operativeWalletStore.wallet.wallet}
        </Text>
        <Text style={styles.walletAddress}>
          {operativeWalletStore.wallet.address}
        </Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Receiver Address"
        value={receiverAddress}
        onChangeText={setReceiverAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount (MATIC)"
        value={amount}
        keyboardType="numeric"
        onChangeText={setAmount}
      />
      <Button title="Send Polygon" onPress={handleSend} />
      {showExplorerButton && (
        <TouchableOpacity
          onPress={handleGoToExplorer}
          style={styles.explorerButton}
        >
          <Text style={styles.explorerButtonText}>Go to Explorer</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    height: 40,
    marginVertical: 12,
    borderWidth: 1,
    padding: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 30,
    marginLeft: 19,
    backgroundColor: "#FFFFFF",
    width: "90%",
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 4,
  },
  explorerButton: {
    backgroundColor: "#25CCF7",
    padding: 10,
    borderRadius: 5,
    marginTop: 30,
  },
  explorerButtonText: {
    color: "#ffffff",
    textAlign: "center",
  },
});

export default SendTransactionPolygon;
