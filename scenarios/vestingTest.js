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

    beforeEach(async ()=>{

      let weiCap = ether(10000);
      let ratePerWei = 9668; //convert to rate per wei
      ico = await ICO.new(wallet,ratePerWei,latestTime(), weiCap);
      token = await OneledgerToken.at(await ico.token());
    });

    //Deploy advisor token vesting contract
    //ICO mints tokens to one advisor token vesting contract
    it ('should be able to create and mint expected token before ico closed', async () => {
      await ico.closeSale(newOwner);
      token.activate({from:newOwner});
      let totalToken = 1933701;
      let vesting1 = await OneledgerTokenVesting.new(advisor1, latestTime()+ duration.minutes(10),duration.weeks(4), tokener(totalToken/12));
      let vesting2 = await OneledgerTokenVesting.new(advisor2, latestTime()+ duration.minutes(10),duration.weeks(4), tokener(totalToken/12));
      await token.transfer(vesting1.address, tokener(1933701),{from:newOwner}).should.be.fulfilled;
      await token.transfer(vesting2.address, tokener(1933701),{from:newOwner}).should.be.fulfilled;
    });
    //Advisor token vesting release schedule, release after first month
    it('should release the token in first month', async () => {
      let totalToken = tokener(1933701);
      let vesting = await OneledgerTokenVesting.new(advisor1, latestTime()+ duration.minutes(10),duration.weeks(4), totalToken/12);
      await ico.mintTokenForVesting(vesting.address, totalToken);
      await ico.closeSale(newOwner);
      await token.activate({from:newOwner});
      await increaseTime(duration.weeks(4)+duration.minutes(20));
      await vesting.release(token.address);
      assert.equal((await token.balanceOf(advisor1)).toNumber(), totalToken/12);
    })

    //Advisor token vesting release schedule, release after two month
    it('should release the token in first month', async () => {
      let totalToken = tokener(1933701);
      let vesting = await OneledgerTokenVesting.new(advisor1, latestTime()+ duration.minutes(10),duration.weeks(4), totalToken/12);
      await ico.mintTokenForVesting(vesting.address, totalToken);
      await ico.closeSale(newOwner);
      await token.activate({from:newOwner});
      await increaseTime(duration.weeks(8)+duration.minutes(20));
      await vesting.release(token.address);
      assert.equal((await token.balanceOf(advisor1)).toNumber(), totalToken/6);
    })

    //Advisor token vesting release schedule, release after three month
    it('should release the token in first month', async () => {
      let totalToken = tokener(1933701);
      let vesting = await OneledgerTokenVesting.new(advisor1, latestTime()+ duration.minutes(10),duration.weeks(4), totalToken/12);
      await ico.mintTokenForVesting(vesting.address, totalToken);
      await ico.closeSale(newOwner);
      await token.activate({from:newOwner});
      await increaseTime(duration.weeks(12)+duration.minutes(20));
      await vesting.release(token.address);
      assert.equal((await token.balanceOf(advisor1)).toNumber(), totalToken/4);
    })
    /**
      Deploy company reserve token vesting contract
        - 10000000 OLT to be vested
        - Starting: after 6 months
        - Vesting period: 18 months
        - Frequency: monthly
        - A valid Beneficiary address for testing
    */
    it('should release the token in first month', async () => {
      let totalToken = tokener(10000000);
      let starting = latestTime() + duration.weeks(24);
      let cycle = 12;
      let frequency = duration.weeks(4);
      let vesting = await OneledgerTokenVesting.new(company, starting,frequency, totalToken/cycle);
      await ico.mintTokenForVesting(vesting.address, totalToken).should.be.fulfilled;
    })
  })
