import React, { useState, useCallback, useEffect, Fragment, useContext, useRef } from "react"
import { Link } from "react-router-dom"
import { Unity, useUnityContext } from "react-unity-webgl";

import { AptosWalletName, useWallet } from "@manahippo/aptos-wallet-adapter"
import { NODE_URL, tokenAddress, FAUCET_URL } from "./../../config";
import { AptosClient, TokenClient, AptosAccount, CoinClient, FaucetClient } from "aptos";
import axios from "axios";

const aptosClient = new AptosClient(NODE_URL);
const coinClient = new CoinClient(aptosClient);
const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL); // <:!:section_1
const aptosCoin = "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>";

export const Home: React.FC = () => {

  const wallet = useWallet();
  const { account, connect, disconnect, connected } = useWallet();
  const [myAddress, setMyAddress] = useState("");


  const { unityProvider, loadingProgression, isLoaded, sendMessage, requestFullscreen, addEventListener, removeEventListener } =
    useUnityContext({
      loaderUrl: "build/Build/build.loader.js",
      dataUrl: "build/Build/build.data",
      frameworkUrl: "build/Build/build.framework.js",
      codeUrl: "build/Build/build.wasm"
    });

  
  const getNFTCountForWallet = async (wallet: any)=>{
    try{
      var data = JSON.stringify({
        query: `query AccountTokensCount($owner_address: String) {
            current_token_ownerships_aggregate(    
              where: {
                  owner_address: {
                      _eq: $owner_address}, amount: {_gt: "0"}}  
              )
              {    aggregate {      count     __typename    }    __typename  }
      }`,
        variables: {"owner_address": wallet}
      });
  
      var config = {
        method: 'post',
        url: 'https://wqb9q2zgw7i7-mainnet.hasura.app/v1/graphql',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      };
  
      const res = await axios(config);
      const totalCount  = res.data.data.current_token_ownerships_aggregate.aggregate.count;
      console.log(totalCount);
      sendMessage("UI", "RequestTotalNFTCount", totalCount);
      return totalCount;
    }catch(err){
      sendMessage("UI", "RequestTotalNFTCount", 0);
      return 0;
    }    
  }

  const getNFTListForWallet = async (wallet: any, limit: any, offset: any)=>{
    try{
      var data = JSON.stringify({
        query: `query AccountTokensData($owner_address: String, $limit: Int, $offset: Int) { 
                   current_token_ownerships(    
                       where: {owner_address: {_eq: $owner_address}, amount: {_gt: "0"}
                       }    
                       limit: $limit    offset: $offset  ) {    token_data_id_hash    name    collection_name    table_type  property_version    amount    __typename  }
                       }`,
        variables: {"owner_address":wallet,"limit":limit,"offset":offset}
      });
      
      var config = {
        method: 'post',
        url: 'https://wqb9q2zgw7i7-mainnet.hasura.app/v1/graphql',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      };
      
      const res = await axios(config)
      const list = res.data.data.current_token_ownerships;
      console.log(list);
      const temp = [];
      for (let i = 0; i < list.length; i++){
        const tokenID = list[i].token_data_id_hash;
        const imageTemp = await getMetadataForNFT (tokenID);
        temp.push(imageTemp)
      }
      console.log(temp)

      sendMessage("UI", "RequestNFTList", JSON.stringify(temp));
      return temp;

    }catch(err){
      console.log(err)
      sendMessage("UI", "RequestNFTList", JSON.stringify([]));
      return [];
    }
  }

  const getMetadataForNFT = async (tokenId: any)=>{
    try{
      var data = JSON.stringify({
        query: `query TokenData($token_id: String) {  current_token_datas(where: {token_data_id_hash: {_eq: $token_id}}) {    token_data_id_hash    name    collection_name    creator_address    default_properties    largest_property_version    maximum    metadata_uri    payee_address   royalty_points_denominator   royalty_points_numerator   supply    __typename  }}`,
        variables: {"token_id":tokenId}
      });
  
      var config = {
        method: 'post',
        url: 'https://wqb9q2zgw7i7-mainnet.hasura.app/v1/graphql',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      };

      const res = await axios(config)
      const metadata  = res.data.data.current_token_datas[0]
      const resData = await axios(metadata.metadata_uri);
      const imageURI = resData.data.image;
      const description = resData.data.image;
      metadata.image = imageURI
      metadata.description = description
      return metadata; // name, collection_name, creator_address, metadata_uri,
    }catch(err){
      console.log(err);
      return "";
    }
  }
  
  const handleGetNFTList = useCallback(async(pageNum: any, walletInfo: any) => {
    console.log("GetNFTList=>", pageNum)
    getNFTListForWallet(JSON.parse(walletInfo).wallet, 10, pageNum*10)
  }, []);

  const handleAptosWalletDisconnect = useCallback(async() => {
    console.log("disconnecting...")
    disconnect()
    console.log("disconnected.")
  }, []);

  const handleAptosWalletConnect = useCallback(async(num: Number) => {
    try{
      if(num == 1){
        const temp: any = "Martian"
        await wallet.select(temp);
      }else if(num == 2){
        const temp: any = "Petra"
        await wallet.select(temp);
      }else if(num == 3){
        const temp: any = "Rise Wallet"
        wallet.select(temp);
      }else if(num == 4){
        const temp: any = "Pontem"
        await wallet.select(temp);
      }else if(num == 5){
        const temp: any = "Fletch"
        await wallet.select(temp);
      }else if(num == 6){
        const temp: any = "Fewcha"
        await wallet.select(temp);
      }
    }catch(err){
      console.log(err)
    }
  }, []);

  useEffect(() => {
    addEventListener("GetNFTList", handleGetNFTList);
    return () => {
      removeEventListener("GetNFTList", handleGetNFTList);
    };
  }, [addEventListener, removeEventListener, handleGetNFTList]);

  useEffect(() => {
    addEventListener("AptosWalletConnect", handleAptosWalletConnect);
    return () => {
      removeEventListener("AptosWalletConnect", handleAptosWalletConnect);
    };
  }, [addEventListener, removeEventListener, handleAptosWalletConnect]);

  useEffect(() => {
    addEventListener("AptosWalletDisconnect", handleAptosWalletDisconnect);
    return () => {
      removeEventListener("AptosWalletDisconnect", handleAptosWalletDisconnect);
    };
  }, [addEventListener, removeEventListener, handleAptosWalletDisconnect]);

  useEffect(() => {  
    if(account?.address){
      setMyAddress(account.address.toString())
      const temp = `(${account.address.toString().slice(0,4)}...${account.address.toString().slice(-4)})`;
      sendMessage("UI", "RequestWalletAddress", JSON.stringify({wallet:account.address.toString(), abbrAddress:temp}));
      getNFTCountForWallet(account.address.toString())
      getNFTListForWallet(account.address.toString(), 10, 0); 
    }else{
      setMyAddress("")
    }
  },[account])

  return (
    <div>
      <Fragment>
          <Unity unityProvider={unityProvider} style={{width: "100vw", height: "100vh" }}/>
      </Fragment>
    </div>
  )
}
