import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Web3Modal from 'web3modal'; 
import { providers, Contract } from 'ethers';
import { useEffect, useRef, useState } from 'react';
import { WHITELIST_CONTRACT_ADDRESS, abi } from '../constants';

export default function Home() {
  // WalletConnected keep track of whether the user is connected to a wallet or not 
  const [walletConnected, setWalletConnected] = useState(false);
  // joinedWhitelist keeps track of whether the user has joined the whitelist or not
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  // loading is set to true when we are waiting for a transaction to get minted
  const [loading, setLoading] = useState(false);
  // numberOfWhitelisted tracks the number of whitelisted addresses
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  // Create a reference to the web3modal (used for connecting metamask) which persists as long as the page is open
  const web3Modal = useRef();

   /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to metamask 
    // Since we store 'web3modal" as a reference, we need to access the current value to get access to the underlining object
    const provider = await web3Modal.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the rinkeby network, throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert('Please connect to the Rinkeby network');
      throw new Error('Please connect to the Rinkeby network');
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer; 
    }
    return web3Provider; 
  }

  // addAddressToWhitelist : Adds the current connected address to the whitelist
  const addAddressToWhitelist = async () => {
    try {
      // We need to get the signer to sign the transaction
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a signer, which allows update methodes
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS, 
        abi, 
        signer
      );
      // Call the addAddressToWhitelist method of the contract
      const tx = await whitelistContract.addAddressToWhitelist();
      setLoading(true); 
      // Wait for the transaction to be mined
      await tx.wait();
      setLoading(false);
      // Get the updated number of whitelisted addresses
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    }catch(error) {
      console.log(error);
    }
  };

  /**
   * getNumberOfWhitelisted:  gets the number of whitelisted addresses
   */
  const getNumberOfWhitelisted = async () => {
    try {
      // Get the provider from web3modal which in our case is MetaMask
      // No need for the signer here as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only have read only access
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS, 
        abi, 
        provider
      );
      // Call the numAddressesWhitelisted method of the contract
      const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
      setNumberOfWhitelisted(_numberOfWhitelisted);
    }catch(error) {
      console.log(error);
    }
  };

    /**
   * checkIfAddressInWhitelist: Checks if the address is in whitelist
   */
  const checkIfAddressInWhitelist = async () => {
    try{
      // We will need the signer later to get the user address 
      // Even though it is a read transaction, since Signers are just special kinds of Providers, we can user it in place of a Provider
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS, 
        abi, 
        signer
      );
      // Get the user address
      const address = await signer.getAddress();
      // call the whitelistedAddresses from the contract 
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(address);
      setJoinedWhitelist(_joinedWhitelist);
    } catch(error) {
      console.log(error);
    }
  };

  /*
    connectWallet: Connects the MetaMask wallet
  */
 const connectWallet = async () => {
   try {
     // Get the provider from web3modal which in our case is MetaMask
     // When used for the first time, it prompts user to connect to metamask
     await getProviderOrSigner();
     setWalletConnected(true);

     checkIfAddressInWhitelist();
     getNumberOfWhitelisted();
   }catch(error) {
     console.log(error);
   }
 }; 

 /*
    renderButton: Returns a button based on the state of the dapp
  */
 const renderButton = () => {
   if (walletConnected) {
     if (joinedWhitelist) {
       return (
         <div className={styles.description}>
           Thanks for joining the whitelist !
          </div>
       );
     } else if (loading) {
       return <button className={styles.button}>Loading...</button>;
     }else {
       return (
         <button className={styles.button} onClick={addAddressToWhitelist}> Join the whitelist </button> 
       );
     }
   } else {
     return (
       <button className={styles.button} onClick={connectWallet}> Connect your wallet </button>
     );
   }
  }

  // useEffect are used to react to changes in the state of website 
  // The array at the end of the function call represents what state changes will trigger this effect 
  // In this case, whenever the value of 'walletConnected' changes, the effect will be called
  useEffect(() => {
    // if wallet is not connected, create a new instant of the web3modal and connect the metamask wallet
    if (!walletConnected) {
      // Assign the web3modal class to the reference object by setting its current value
      // The current value is persisted throughout as long as the page is opened
      web3Modal.current = new Web3Modal({
        network: 'rinkeby',
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by KU2NO
      </footer>
    </div>
  );
 }