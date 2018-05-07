const OneledgerToken = artifacts.require('OneledgerToken');
const ICO = artifacts.require("ICO");
const {increaseTime, latestTime, duration} = require('../test/timeIncrease')(web3);
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('ICO contract -- buyTokens', function([owner, wallet, user, userNotInWhiteList, superRichUser, newOwner]) {
  let ico ;
  let token;

  beforeEach(async ()=>{
    let weiCap = web3.toWei(10000);
    let ratePerWei = 9668; // convert to rate per wei
    ico = await ICO.new(wallet,ratePerWei,latestTime()+duration.days(10), weiCap);
    token = OneledgerToken.at(await ico.token());
    await ico.addToWhiteList([user], web3.toWei(4.8));
  });

  /**
    Send valid number of ETH from a whitelisted address to ICO contract to buy OLT tokens before ICO start time
      - A whitelisted Tier 1 Ethereum address
      - A valid Tier 1 day-1 allocation (1.5 ETH)
      - Set time before ICO starting time
  */
  it("should reject purchase before ICO started", async () => {
    ico.sendTransaction({from: user, value: web3.toWei(1)}).should.be.rejectedWith('revert');
  });

  /**
  Send valid number of ETH from a whitelisted address to ICO contract to buy OLT tokens
    - A whitelisted Tier 1 Ethereum address
    - A valid Tier 1 day-1 allocation (1.5 ETH)
    - Set time after ICO starting time
  */
  it("should fulfill purchase after ICO is started", async () => {
    let eth_before = await web3.eth.getBalance(wallet);
    await increaseTime(duration.days(10) + duration.minutes(1));
    await ico.sendTransaction({from: user, value: web3.toWei(1.5)}).should.be.fulfilled;
    let eth_after = await web3.eth.getBalance(wallet);
    assert.equal(eth_after.minus(eth_before).toNumber(), web3.toWei(1.5));
    let tokenBalance = await token.balanceOf(user);
    assert.equal(tokenBalance.toNumber(), web3.toWei(14502));
  });

  /**
  Send valid number of ETH from an address that is not whitelisted to ICO contract to buy OLT tokens
    - An Ethereum address that is not whitelisted
    - A valid Tier 1 day-1 allocation (1.5 ETH)
    - Set time after ICO starting time (test day 1, day 2, day 3 after seperately)
  */
  it("should reject purchase for the user that is not in whiteList", async () => {
    await increaseTime(duration.days(10) + duration.minutes(1));
    await ico.sendTransaction({from: userNotInWhiteList, value: web3.toWei(1.5)}).should.be.rejectedWith('revert');
  });

  /**
  Send invalid number of ETH from a whitelisted address to ICO contract to buy OLT tokens on the first day
    - A whitelisted Tier 1 Ethereum address
    - A invalid Tier 1 day-1 allocation (4.81 ETH)
    - Set time after ICO starting time but first day
  */
  it("should reject purchase for the user that send eth exceed the limitation", async () => {
    await increaseTime(duration.days(10) + duration.minutes(1));
    await ico.sendTransaction({from: user, value: web3.toWei(4.81)}).should.be.rejectedWith('revert');
  })

  /**
  Send valid bigger number of ETH from a whitelisted address to ICO contract to buy OLT tokens on the second day
  - A whitelisted Tier 1 Ethereum address
  - A valid Tier 1 day-2 allocation (9.5 ETH)
  - Set time to second day
  */
  it("should fulfilled purchase after second day of ICO started with double purchase", async () => {
    let eth_before = await web3.eth.getBalance(wallet);
    await increaseTime(duration.days(11) + duration.minutes(1));
    await ico.sendTransaction({from: user, value: web3.toWei(9.5)}).should.be.fulfilled;
    let eth_after = await web3.eth.getBalance(wallet);
    assert.equal(eth_after.minus(eth_before).toNumber(), web3.toWei(9.5));
    let tokenBalance = await token.balanceOf(user);
    assert.equal(tokenBalance.toNumber(), web3.toWei(91846));
  });

  /**
  Send invalid bigger number of ETH from a whitelisted address to ICO contract to buy OLT tokens on the second day
    - A whitelisted Tier 1 Ethereum address
    - A invalid Tier 1 day-2 allocation (9.7 ETH)
    - Set time to second day
  */
  it("should rejected purchase for the user that send eth exceed the limitation for the second day", async () => {
    await increaseTime(duration.days(11) + duration.minutes(1));
    await ico.sendTransaction({from: user, value: web3.toWei(9.7)}).should.be.rejectedWith('revert');
  })

  /**
  Send very big number of ETH from a whitelisted address to ICO contract to buy OLT tokens on the third day and after
    - A whitelisted Tier 1 Ethereum address
    - Send 9.7 ETH
    - Set time after third day
  */
  it("should fulfilled purchase after third day of ICO started with big amount of ETH", async () => {
    let eth_before = await web3.eth.getBalance(wallet);
    await increaseTime(duration.days(12) + duration.minutes(1));
    await ico.sendTransaction({from: user, value: web3.toWei(9.7)}).should.be.fulfilled;
    let eth_after = await web3.eth.getBalance(wallet);
    assert.equal(eth_after.minus(eth_before).toNumber(), web3.toWei(9.7));
    let tokenBalance = await token.balanceOf(user);
    assert.equal(tokenBalance.toNumber(), web3.toWei(93779.6));
  });

  /**
  On the third day or after, send enough ETH to the ICO contract to cover the remaining ETH.
    - A whitelisted Tier 1 Ethereum address
    - ICO has collected 999997 ETH
    - Send 5 ETH
    - Set time after third day
  */
  it("should reject purchase after the thir day if ico has collected enough eth", async () => {
    let weiCap = web3.toWei(100);
    let ratePerWei = 9668;
    let ico2 = await ICO.new(wallet, ratePerWei, latestTime() + duration.days(10), weiCap);

    await ico2.addToWhiteList([user], web3.toWei(4.8));

    await ico2.addToWhiteList([superRichUser], web3.toWei(1000000)); // Super user would be able to put the ICO contract has enough eth_after
    await increaseTime(duration.days(12) + duration.minutes(1));
    await ico2.sendTransaction({from: superRichUser, value: web3.toWei(97)}).should.be.fulfilled;
    await ico2.sendTransaction({from: user, value: web3.toWei(4)}).should.be.rejectedWith('revert');
    await ico2.sendTransaction({from: user, value: web3.toWei(3)}).should.be.fulfilled;
  })

  it("should reject the second purchase within 24 hours", async () => {
    await increaseTime(duration.days(11) + duration.minutes(1));
    await ico.sendTransaction({from: user, value: web3.toWei(2)}).should.be.fulfilled;
    await ico.sendTransaction({from: user, value: web3.toWei(2)}).should.be.rejectedWith('revert');
  })

  it("should not allow token to be able to transfer before close sale", async () => {
    await increaseTime(duration.days(11) + duration.minutes(1));
    await ico.sendTransaction({from: user, value: web3.toWei(2)}).should.be.fulfilled;
    await token.transfer(userNotInWhiteList, web3.toWei(10), {from: user}).should.be.rejectedWith('revert');
  })

  it("should allow token to be able to transfer after close sale and token activate", async () => {
    await increaseTime(duration.days(11) + duration.minutes(1));
    await ico.sendTransaction({from: user, value: web3.toWei(2)}).should.be.fulfilled;
    await ico.closeSale();
    await token.activate();
    await token.transfer(userNotInWhiteList, web3.toWei(10), {from: user}).should.be.fulfilled;
  })
})
