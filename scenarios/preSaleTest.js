const OneledgerToken = artifacts.require('OneledgerToken');
const ICO = artifacts.require("ICO");
const OneledgerTokenVesting = artifacts.require("OneledgerTokenVesting");
const {increaseTime, latestTime, duration} = require('../test/timeIncrease')(web3);
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();
  contract('ICO contract', function([tokenOwner, wallet, user, nonaddToWhiteListUser,otherUser,newOwner, advisor]) {

    let token;
    let ico;

    beforeEach(async ()=>{
      //let weiCap = 1000000 * (10 ** 18);//covert eth to wei
      let weiCap = 10000 * (10 ** 18);
      let ratePerWei = 9668; //convert to rate per wei
      ico = await ICO.new(wallet,ratePerWei,latestTime(), weiCap);
      token = OneledgerToken.at(await ico.token());
      await ico.addToWhiteList([user], 4.8 * (10 ** 18));
    });
    it('should not allow to buy new token when ICO contract is closed', async () => {
      await ico.closeSale(newOwner);
      await ico.sendTransaction({from: user, value: 4.8 * (10 ** 18)}).should.be.rejectedWith('revert');
      let balanceOf = await token.balanceOf(newOwner);
      assert.equal(balanceOf.toNumber(), 1000000000 * (10 ** 18))
    });
    it('should be able to allow deploy the vesting contract', async () => {
      let totalToken = 1933701 * (10**18);
      await OneledgerTokenVesting.new(advisor, latestTime(),
                                                duration.weeks(4), totalToken/12).should.be.fulfilled;
    })
  })
