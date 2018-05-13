const OneledgerToken = artifacts.require('OneledgerToken');
const ICO = artifacts.require("ICO");
const OneledgerTokenVesting = artifacts.require("OneledgerTokenVesting");
const {increaseTime, latestTime, duration} = require('../test/timeIncrease')(web3);
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();
  contract('Vesting contract', function([owner, wallet, advisor1, advisor2, company]) {

    let token;
    let ico;
    let vesting;

    beforeEach(async ()=>{

      let weiCap = web3.toWei(10000);
      let ratePerWei = 9668; // convert to rate per wei
      ico = await ICO.new(wallet, ratePerWei, latestTime(), weiCap);
      token = await OneledgerToken.at(await ico.token());
    });

    //Deploy advisor token vesting contract
    //ICO mints tokens to one advisor token vesting contract
    it ('should be able to create and mint expected token before ico closed', async () => {
      await ico.closeSale();
      token.activate();
      let totalToken = 1933701;
      let vesting1 = await OneledgerTokenVesting.new(advisor1, latestTime()+ duration.minutes(10),duration.weeks(4), web3.toWei(totalToken/12), token.address);
      let vesting2 = await OneledgerTokenVesting.new(advisor2, latestTime()+ duration.minutes(10),duration.weeks(4), web3.toWei(totalToken/12), token.address);
      await token.transfer(vesting1.address, web3.toWei(1933701)).should.be.fulfilled;
      await token.transfer(vesting2.address, web3.toWei(1933701)).should.be.fulfilled;
    });
    //Advisor token vesting release schedule, release after first month
    it('should release the token in first month', async () => {
      let totalToken = web3.toWei(1933701);
      let vesting = await OneledgerTokenVesting.new(advisor1, latestTime()+ duration.minutes(10),duration.weeks(4), totalToken/12, token.address);
      await ico.mintToken(vesting.address, totalToken);
      await ico.closeSale();
      await token.activate();
      await increaseTime(duration.weeks(4)+duration.minutes(20));
      await vesting.release();
      assert.equal((await token.balanceOf(advisor1)).toNumber(), totalToken/12);
    })

    //Advisor token vesting release schedule, release after two month
    it('should release the token in first month and second months', async () => {
      let totalToken = web3.toWei(1933701);
      let vesting = await OneledgerTokenVesting.new(advisor1, latestTime() + duration.minutes(10),duration.weeks(4), totalToken / 12, token.address);
      await ico.mintToken(vesting.address, totalToken);
      await ico.closeSale();
      await token.activate();
      await increaseTime(duration.weeks(8) + duration.minutes(20));
      await vesting.release();
      assert.equal((await token.balanceOf(advisor1)).toNumber(), totalToken / 6);
    })

    //Advisor token vesting release schedule, release after three month
    it('should release the token in first month, second and third months', async () => {
      let totalToken = web3.toWei(1933701);
      let vesting = await OneledgerTokenVesting.new(advisor1, latestTime() + duration.minutes(10), duration.weeks(4), totalToken / 12, token.address);
      await ico.mintToken(vesting.address, totalToken);
      await ico.closeSale();
      await token.activate();
      await increaseTime(duration.weeks(12) + duration.minutes(20));
      await vesting.release();
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
    it('should release the token for the compnay reserved vesting contract', async () => {
      let totalToken = web3.toWei(12000000);
      let starting = latestTime() + duration.weeks(24);
      let cycle = 12;
      let frequency = duration.weeks(4);
      let vesting = await OneledgerTokenVesting.new(company, starting, frequency, totalToken / cycle, token.address);
      await ico.mintToken(vesting.address, totalToken).should.be.fulfilled;
    })
  })
