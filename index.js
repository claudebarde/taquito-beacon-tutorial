import "babel-polyfill";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { Tezos } from "@taquito/taquito";

const contractAddress = "KT1PCLg8Da8T5h5SWibMopPVsxiKg27tSRxx";
let userAddress, userBalance, contractInstance;

window.onload = () => {
  document.getElementById("init-wallet").onclick = initWallet;
  document.getElementById("update-message").onclick = changeMessage;
  document.getElementById("increment-button").onclick = increment;
  document.getElementById("decrement-button").onclick = decrement;
};

const updateInnerText = (id, text) =>
  (document.getElementById(id).innerText = text);

const initWallet = async () => {
  try {
    Tezos.setProvider({ rpc: `https://carthagenet.SmartPy.io` });
    // creating new Beacon wallet instance
    const wallet = new BeaconWallet({ name: "Taquito Beacon Tutorial" });
    // setting up network
    const network = {
      type: "carthagenet",
    };
    // setting Beacon wallet as wallet provider for Taquito
    Tezos.setWalletProvider(wallet);
    // requesting permissions on selected network
    await wallet.requestPermissions({ network });
    // getting user's address
    userAddress = wallet.permissions.address;
    console.log("Your address:", userAddress);
    // getting user's balance on Carthagenet
    userBalance = await Tezos.tz.getBalance(userAddress);
    // getting info from smart contract
    contractInstance = await Tezos.wallet.at(contractAddress);
    const storage = await contractInstance.storage();
    // hides button then shows and populates contract interface
    document.getElementById("connection").style.display = "none";
    document.getElementById("interface").style.display = "block";
    updateInnerText("user-address", userAddress);
    updateInnerText("user-balance", userBalance / 1000000);
    updateInnerText("current-message", storage.message);
    updateInnerText("current-value", storage.integer);
  } catch (error) {
    console.log(error);
  }
};

const changeMessage = async () => {
  document.getElementById("update-message").disabled = true;
  // displays loader
  document.getElementById("loader").style.display = "block";
  const message = document.getElementById("new-message").value;
  try {
    const op = await contractInstance.methods.changeMessage(message).send();
    await op.confirmation();
    document.getElementById("new-message").value = "";
    // reloads storage
    const storage = await contractInstance.storage();
    updateInnerText("current-message", storage.message);
  } catch (error) {
    console.log(error);
  } finally {
    document.getElementById("update-message").disabled = false;
    document.getElementById("loader").style.display = "none";
  }
};

const increment = async () => {
  document.getElementById("increment-button").disabled = true;
  document.getElementById("loader").style.display = "block";
  try {
    const op = await contractInstance.methods.increment(1).send();
    await op.confirmation();
    // reloads storage
    const storage = await contractInstance.storage();
    updateInnerText("current-value", storage.integer);
  } catch (error) {
    console.log(error);
  } finally {
    document.getElementById("increment-button").disabled = false;
    document.getElementById("loader").style.display = "none";
  }
};

const decrement = async () => {
  document.getElementById("decrement-button").disabled = true;
  document.getElementById("loader").style.display = "block";
  try {
    const op = await contractInstance.methods.decrement(1).send();
    await op.confirmation();
    // reloads storage
    const storage = await contractInstance.storage();
    updateInnerText("current-value", storage.integer);
  } catch (error) {
    console.log(error);
  } finally {
    document.getElementById("decrement-button").disabled = false;
    document.getElementById("loader").style.display = "none";
  }
};
