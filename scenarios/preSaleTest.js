const OneledgerToken = artifacts.require('OneledgerToken');
const ICO = artifacts.require("ICO");
const OneledgerTokenVesting = artifacts.require("OneledgerTokenVesting");
const {increaseTime, latestTime, duration} = require('../test/timeIncrease')(web3);
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();
  contract('ICO contract -- presale', function([tokenOwner, wallet, user, nonaddToWhiteListUser,otherUser,newOwner, advisor]) {

    let token;
    let ico;

    beforeEach(async () => {
      let weiCap = web3.toWei(10000);
      let ratePerWei = 9668; // convert to rate per wei
      ico = await ICO.new(wallet, ratePerWei, latestTime(), weiCap);
      token = OneledgerToken.at(await ico.token());
      await ico.addToWhiteList([user], web3.toWei(4.8));
    });

    it('should not allow to buy new token when ICO contract is closed', async () => {
      await ico.closeSale();
      await ico.sendTransaction({from: user, value: web3.toWei(4.8)}).should.be.rejectedWith('revert');
      let balanceOf = await token.balanceOf(web3.eth.coinbase);
      assert.equal(balanceOf.toNumber(), web3.toWei(1000000000))
    });

    it('should be able to allow deploy the vesting contract', async () => {
      let totalToken = web3.toWei(1933701);
      await OneledgerTokenVesting.new(advisor, latestTime() + duration.minutes(10),
                                      duration.weeks(4), totalToken / 12, token.address).should.be.fulfilled;
    })
  })
