const ICO = artifacts.require("ICO");
const Oneledger =  artifacts.require("Oneledger");


module.exports = async (deployer, network, accounts) => {
  function latestTime () {
   let lastBlock = web3.eth.getBlock('latest');
   return lastBlock.timestamp;
  }
  // deployment steps
  let weiCap = 10000000000000000000000;
  let ratePerWei = 9668; // convert to rate per wei
  let ico = await ICO.new(web3.eth.coinbase, ratePerWei,latestTime(), weiCap);
  let token = OneledgerToken.at(await ico.token());
  console.log(`ICO deployed at ${ico.address}`);
  console.log(`Token deployed at ${token.address}`);
  //await deployer.deploy(TimeLock,OneledgerToken.address);
};
