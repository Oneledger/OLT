/**
  Deploy OneLedger ICO Contract
    - ETH/USD is pegged at $500
    - Targeted ETH # for crowdsale: 1 million (5 million/500)
    - Token ETH price: 0.0001034386 ($0.0517142857/$500)
    - Token # per ETH: 9668
    - Total OLT number for crowdsale: 96685082.87
    - A valid ETH wallet address
*/
const OneledgerToken = artifacts.require('OneledgerToken');
const ICO = artifacts.require("ICO");
const {increaseTime, latestTime, duration} = require('../test/timeIncrease')(web3);
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('ICO Contract -- deployment', function([owner, wallet]) {

  it("should be able to deployed success", async () => {
    let weiCap = web3.toWei(10000); // covert eth to wei
    let ratePerWei = 9668; // convert to rate per wei
    await ICO.new(wallet, ratePerWei, latestTime(), weiCap).should.be.fulfilled;
  });

})
