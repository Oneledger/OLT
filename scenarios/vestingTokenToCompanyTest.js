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
      let starting = latestTime() + duration.weeks(20);//give 4 weeks space so that vesting can happen at exactly 24 weeks
      let cycle = 12;
      let frequency = duration.weeks(4);
      vesting = await OneledgerTokenVesting.new(company, starting,frequency, totalToken/cycle);
      await ico.mintTokenForVesting(vesting.address, totalToken);
      await ico.closeSale(newOwner);
      await token.activate({from:newOwner});
    });

    //Release starting from the first 6 months
    it('should release the token in first 6 month', async () => {
      await increaseTime(duration.weeks(24) + duration.minutes(10));
      await vesting.release(token.address).should.be.fulfilled;
      assert.equal((await token.balanceOf(company)).toNumber(), totalToken/12);
    })
    //Release starting from the first 7 months
    it('should release the token in first 7 month', async () => {
      await increaseTime(duration.weeks(24) + duration.minutes(10));
      await vesting.release(token.address).should.be.fulfilled;
      assert.equal((await token.balanceOf(company)).toNumber(), totalToken/12);
      await increaseTime(duration.weeks(4) + duration.minutes(10));
      await vesting.release(token.address).should.be.fulfilled;
      assert.equal((await token.balanceOf(company)).toNumber(), totalToken/6);
    })
    //Release starting from the first 9 months
    it('should release the token in first 7 month', async () => {
      await increaseTime(duration.weeks(24) + duration.minutes(10));
      await vesting.release(token.address).should.be.fulfilled;
      assert.equal((await token.balanceOf(company)).toNumber(), totalToken/12);
      await increaseTime(duration.weeks(4) + duration.minutes(10));
      await vesting.release(token.address).should.be.fulfilled;
      assert.equal((await token.balanceOf(company)).toNumber(), totalToken/6);
      await increaseTime(duration.weeks(4) + duration.minutes(10));
      await vesting.release(token.address).should.be.fulfilled;
      assert.equal((await token.balanceOf(company)).toNumber(), totalToken/4);
      await increaseTime(duration.weeks(4) + duration.minutes(10));
      await vesting.release(token.address).should.be.fulfilled;
      assert.equal((await token.balanceOf(company)).toNumber(), totalToken/3);
    })
  })
