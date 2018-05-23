const OneledgerToken = artifacts.require('OneledgerToken');
const ICO = artifacts.require("ICO");
const OneledgerTokenVesting = artifacts.require("OneledgerTokenVesting");
const {increaseTime, latestTime, duration} = require('../test/timeIncrease')(web3);
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();
  contract('Vesting contract -- quarterly release', function([owner, wallet, advisor1, advisor2, company]) {

    let token;
    let ico;
    let vesting;
    let totalToken;

    beforeEach(async ()=>{

      let weiCap = web3.toWei(10000);
      let ratePerWei = 9668; //convert to rate per wei
      ico = await ICO.new(wallet,ratePerWei,latestTime(), weiCap);
      token = await OneledgerToken.at(await ico.token());
      totalToken = web3.toWei(12000000);
      let starting = latestTime() + duration.minutes(10);
      let cycle = 4;
      let frequency = duration.weeks(13);
      vesting = await OneledgerTokenVesting.new(advisor1, starting, frequency, totalToken / cycle, token.address);
      await ico.mintToken(vesting.address, totalToken);
      await ico.closeSale();
      await token.activate();
    });

    it('should release the token in a year quaterly', async () => {
      await increaseTime(duration.weeks(13) + duration.minutes(10));
      await vesting.release().should.be.fulfilled;
      assert.equal((await token.balanceOf(advisor1)).toNumber(), totalToken / 4);
      await increaseTime(duration.weeks(13) + duration.minutes(10));
      await vesting.release().should.be.fulfilled;
      assert.equal((await token.balanceOf(advisor1)).toNumber(), totalToken / 2);
      await increaseTime(duration.weeks(13) + duration.minutes(10));
      await vesting.release().should.be.fulfilled;
      assert.equal((await token.balanceOf(advisor1)).toNumber(), web3.toBigNumber(totalToken).times(3).dividedBy(4).toNumber());
      await increaseTime(duration.weeks(13) + duration.minutes(10));
      await vesting.release().should.be.fulfilled;
      assert.equal((await token.balanceOf(advisor1)).toNumber(), totalToken);
    })
  })
