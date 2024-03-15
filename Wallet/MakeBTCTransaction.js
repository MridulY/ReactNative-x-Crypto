import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  Linking
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import CryptoStore from "../MobXStore";
import WalletDetails from "../WalletDetails";
import { ECPair, networks, TransactionBuilder, payments } from "bitcoinjs-lib";
import * as bip32 from "bip32";
import * as bip39 from "bip39";
import { validate, getAddressInfo } from "bitcoin-address-validation";

const SERVER_URL = "https://api.blockcypher.com/v1/btc/test3";

const TransactionUI = ({ prepareTransaction }) => {
  const [receiverAddress, setReceiverAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0); 
  const [transactionId, setTransactionId] = useState(null);
  const [showExplorerButton, setShowExplorerButton] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
    };
    fetchBalance();
  }, []);
  const handleTransactionSuccess = (txId) => {
    setTransactionId(txId);
    setShowExplorerButton(true);
  };
  const operativeWalletStore = {
    wallet: {
      wallet: "My Wallet Name",
      address: "1BoatSLRHtKNngkdXEeobR76b53LETtpyT", 
      privateKey: "your_private_key_here", 
    },
  };
  const userBalance = "0.5"; // Example balance
  const currentUsingChain = { chain: "Bitcoin" };

  const handleSubmit = async () => {
    console.log("Triggering transaction function");

    if (receiverAddress.length !== 34) {
      Alert.alert("Error", "Invalid Bitcoin address");
      return;
    }

    const satoshiAmount = Math.floor(Number(amount) * 1e8);
    try {
      // Define network
      const network = networks.testnet;
      const privateKeyWIF = CryptoStore.btcAddress[0];
      console.log(privateKeyWIF);
      const keyPair = ECPair.fromWIF(privateKeyWIF, network);
      const { address } = payments.p2pkh({
        pubkey: keyPair.publicKey,
        network: networks.testnet,
      });

      console.log(SERVER_URL);
      console.log(address);
      const utxosResponse = await axios.get(
        `${SERVER_URL}/addrs/${address}?unspentOnly=true&confirmations=1`
      );
      const utxos = utxosResponse.data.txrefs;
      console.log(utxos);

      if (!utxos || utxos.length === 0) {
        Alert.alert("Error", "No UTXOs found for this address.");
        return;
      }

      // TransactionBuilder
      const txb = new TransactionBuilder(network);
      console.log("txb");
      let inputSum = 0;
      utxos.forEach((utxo) => {
        txb.addInput(utxo.tx_hash, utxo.tx_output_n);
        inputSum += utxo.value;
      });

      txb.addOutput(address, satoshiAmount);

      if (inputSum > satoshiAmount + 10000) {
        txb.addOutput(address, inputSum - satoshiAmount - 10000); 
      }

      utxos.forEach((_, index) => {
        txb.sign(index, keyPair);
      });
      console.log("before axios");
      const rawTx = txb.build().toHex();
      console.log(rawTx);
      const broadcastResponse = await axios.post(`${SERVER_URL}/txs/push`, {
        tx: rawTx,
      });
      console.log("Transaction broadcasted:", broadcastResponse.data);
      const txHash = broadcastResponse.data.tx.hash; 
      console.log("Transaction broadcasted:", txHash);
      handleTransactionSuccess(txHash)

      Alert.alert(
        "Success",
        `Transaction broadcasted. TX ID: ${broadcastResponse.data.tx.hash}`
      );
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        const errors = error.response.data.errors;
        console.error("Broadcast Error:", errors);
        // Check if the error is because the transaction already exists
        errors.forEach((err) => {
          if (err.error && err.error.includes("already exists")) {
            // Handle the specific case of an already existing transaction
            Alert.alert(
              "Transaction Error",
              "This transaction has already been broadcasted."
            );
          }
        });
      } else {
        console.error("Error sending Bitcoin:", error);
        alert("Transaction failed: " + (error.message || "Unknown error"));
      }
    }
  };

  const handleGoToExplorer = () => {
    const explorerUrl = `https://live.blockcypher.com/btc-testnet/tx/${transactionId}/`;
    Linking.openURL(explorerUrl).catch((err) =>
      console.error("Failed to open the URL:", err)
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
        <Text style={styles.currentChain}>
          Selected Chain: {currentUsingChain.chain}
        </Text>
        <Text style={styles.currentChain}>Wallet Balance: {userBalance}</Text>
      </View>
      <Text style={styles.label}>Receiver's Address:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter receiver's Bitcoin address"
        value={receiverAddress}
        onChangeText={setReceiverAddress}
      />
      <Text style={styles.label}>Amount (BTC):</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount to send"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Send Bitcoin</Text>
      </TouchableOpacity>
      {showExplorerButton && (
        <TouchableOpacity
          onPress={handleGoToExplorer}
          style={styles.explorerButton}
        >
          <Text style={styles.explorerButtonText}>Go to Explorer</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
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
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#cccccc",
    marginBottom: 20,
    padding: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
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

export default TransactionUI;
