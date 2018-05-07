/**
  Add whitelist to ICO contract
    - Tier 1 - 500 Addresses, allocation 4.8 ETH
    - TIer 2 - 2500 Addresses, allocation 1.36 ETH
    - Tier 3 - 7000 Addresses, allocation 0.6 ETH
*/
const OneledgerToken = artifacts.require('OneledgerToken');
const ICO = artifacts.require("ICO");
const {increaseTime, latestTime, duration} = require('../test//timeIncrease')(web3);
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();


contract('ICO contract -- whitelisting tiers', function([wallet, ...users]) {

  let ico;

  beforeEach(async ()=>{
    let weiCap = web3.toWei(10000); // covert eth to wei
    let ratePerWei = 9668; // convert to rate per wei
    ico = await ICO.new(wallet, ratePerWei, latestTime(), weiCap);
  });

  it("should allow to add tier 1 users", async () => {
    //simple fake address generator
    let addresses = []
    for (let i = 1; i <= 500; i++){
      addresses.push(`0x${("0000000000000000000000000000000000000000" + i).substr(-40)}`);
    }
    for (let i = 0; i < 5; i++){
      await ico.addToWhiteList(addresses.slice(i * 100, i * 100 + 99), 1.36 * (10 ** 18)).should.be.fulfilled;
    }
  });

  it("should allow to add tier 2 users", async () => {
    //simple fake address generator
    let addresses = []
    for (let i = 1; i <= 2500; i++){
      addresses.push(`0x${("0000000000000000000000000000000000000000" + i).substr(-40)}`);
    }
    for (let i=0; i < 25; i++){
      await ico.addToWhiteList(addresses.slice(i * 100, i * 100 + 99), 1.36 * (10 ** 18)).should.be.fulfilled;
    }
  });

  it("should allow to add tier 3 users", async () => {
    //simple fake address generator
    let addresses = []
    for (let i = 1; i <= 7000; i++){
      addresses.push(`0x${("0000000000000000000000000000000000000000" + i).substr(-40)}`);
    }
    for (let i = 0; i < 70; i++){
      await ico.addToWhiteList(addresses.slice(i * 100, i * 100 + 99), 0.6 * (10 ** 18)).should.be.fulfilled;
    }
  })
})
