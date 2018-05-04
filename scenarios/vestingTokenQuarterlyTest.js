const OneledgerToken = artifacts.require('OneledgerToken');
const ICO = artifacts.require("ICO");
const OneledgerTokenVesting = artifacts.require("OneledgerTokenVesting");
const {increaseTime, latestTime, duration} = require('../test/timeIncrease')(web3);
const {tokener,ether} = require('../test/tokener');
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();
  contract('The vesting contract', function([owner, newOwner, wallet, advisor1, advisor2, company]) {

    let token;
    let ico;
    let vesting;
    let totalToken;

    beforeEach(async ()=>{

      let weiCap = ether(10000);
      let ratePerWei = 9668; //convert to rate per wei
      ico = await ICO.new(wallet,ratePerWei,latestTime(), weiCap);
      token = await OneledgerToken.at(await ico.token());
      totalToken = tokener(12000000);
      let starting = latestTime() + duration.minutes(10);
      let cycle = 4;
      let frequency = duration.weeks(13);
      vesting = await OneledgerTokenVesting.new(advisor1, starting,frequency, totalToken/cycle);
      await ico.mintTokenToNewAddress(vesting.address, totalToken);
      await ico.closeSale(newOwner);
      await token.activate({from:newOwner});
    });

    it('should release the token in a year quaterly', async () => {
      await increaseTime(duration.weeks(13) + duration.minutes(10));
      await vesting.release(token.address).should.be.fulfilled;
      assert.equal((await token.balanceOf(advisor1)).toNumber(), totalToken/4);
      await increaseTime(duration.weeks(13) + duration.minutes(10));
      await vesting.release(token.address).should.be.fulfilled;
      assert.equal((await token.balanceOf(advisor1)).toNumber(), totalToken/2);
      await increaseTime(duration.weeks(13) + duration.minutes(10));
      await vesting.release(token.address).should.be.fulfilled;
      assert.equal((await token.balanceOf(advisor1)).toNumber(), new BigNumber(totalToken).times(3).dividedBy(4).toNumber());
      await increaseTime(duration.weeks(13) + duration.minutes(10));
      await vesting.release(token.address).should.be.fulfilled;
      assert.equal((await token.balanceOf(advisor1)).toNumber(), totalToken);
    })
  })
