var OneledgerToken = artifacts.require('OneledgerToken.sol');
var OneledgerTokenVesting = artifacts.require('./OneledgerTokenVesting.sol');
var ICO = artifacts.require("ICO");
const {increaseTime, latestTime, duration} = require('./timeIncrease')(web3);
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('ICO', function([wallet, user, nonaddToWhiteListUser, otherUser, beneficiary]) {

  let ico;
  let token;
  let rate = 10;

  beforeEach(async ()=>{
    ico = await ICO.new(wallet, rate, latestTime() + duration.days(1), web3.toWei(10000));
    token = await OneledgerToken.at(await ico.token());
  });

  it('should be able to mint new token for vesting contract', async () => {
    let vesting = await OneledgerTokenVesting.new(beneficiary,
                                                  latestTime() + duration.minutes(10),
                                                  duration.weeks(4),
                                                  web3.toWei(10),
                                                  token.address);
    await ico.mintToken(vesting.address, web3.toWei(120)).should.be.fulfilled;
  })

  it('should not be able to buy token, since user is not in the whitelist', async () => {
    let eth_before = await web3.eth.getBalance(wallet);
    let eth_after = await web3.eth.getBalance(wallet);
    await increaseTime(duration.days(1) + duration.seconds(1));
    await ico.sendTransaction({from: user, value: web3.toWei(4)}).should.be.rejectedWith('revert');
    assert.equal(eth_after.minus(eth_before), 0);
  });

  it('should be able to buy token when the user was added in the addToWhiteList', async () => {
    await ico.addToWhiteList([user], web3.toWei(1));
    await increaseTime(duration.days(1) + duration.seconds(1));
    let eth_before = await web3.eth.getBalance(wallet);
    await ico.sendTransaction({from: user, value: web3.toWei(1)}).should.be.fulfilled;
    let userBalance = await token.balanceOf(user);
    userBalance.should.be.bignumber.equal(rate * web3.toWei(1));
    await ico.sendTransaction({from: user, value: web3.toWei(1)}).should.be.rejectedWith('revert');
    let eth_after = await web3.eth.getBalance(wallet);
    assert.equal(eth_after.minus(eth_before), web3.toWei(1));
  });

  it('should be able to buy token when the user was added in the addToWhiteList, the second day buy double', async () => {
    await ico.addToWhiteList([user],web3.toWei(1));
    let eth_before = await web3.eth.getBalance(wallet);
    await increaseTime(duration.days(1) + duration.seconds(1));
    await ico.sendTransaction({from: user, value: web3.toWei(1)}).should.be.fulfilled;
    let userBalance = await token.balanceOf(user);
    userBalance.should.be.bignumber.equal(rate * web3.toWei(1));
    await ico.sendTransaction({from: user, value: web3.toWei(1)}).should.be.rejectedWith('revert');
    await increaseTime(duration.days(1) + duration.seconds(1));
    await ico.sendTransaction({from: user, value: web3.toWei(3)}).should.be.rejectedWith('revert');
    await ico.sendTransaction({from: user, value: web3.toWei(2)}).should.be.fulfilled;
    userBalance = await token.balanceOf(user);
    userBalance.should.be.bignumber.equal(rate * web3.toWei(3));
    await ico.sendTransaction({from: user, value: web3.toWei(2)}).should.be.rejectedWith('revert');
    let eth_after = await web3.eth.getBalance(wallet);
    assert.equal(eth_after.minus(eth_before), web3.toWei(3));
  });

  it('should be able to buy token when the user was added in the addToWhiteList, the second day buy double, the third day free for all', async () => {
    await ico.addToWhiteList([user, otherUser], web3.toWei(1));
    let eth_before = await web3.eth.getBalance(wallet);
    await increaseTime(duration.days(1) + duration.seconds(1));
    await ico.sendTransaction({from: user, value: web3.toWei(0.1)}).should.be.fulfilled;
    await ico.sendTransaction({from: user, value: web3.toWei(0.1)}).should.be.rejectedWith('revert');
    await increaseTime(duration.days(1) + duration.seconds(10));
    await ico.sendTransaction({from: user, value: web3.toWei(0.2)}).should.be.fulfilled;
    await ico.sendTransaction({from: user, value: web3.toWei(0.2)}).should.be.rejectedWith('revert');
    await increaseTime(duration.days(1) + duration.seconds(10));
    await ico.sendTransaction({from: user, value: web3.toWei(0.4)}).should.be.fulfilled;
    await ico.sendTransaction({from: user, value: web3.toWei(0.3)}).should.be.rejectedWith('revert'); // one day one purchase
    await increaseTime(duration.days(1) + duration.seconds(10));
    await ico.sendTransaction({from: user, value: web3.toWei(0.1)}).should.be.fulfilled;
    await ico.sendTransaction({from: nonaddToWhiteListUser, value: web3.toWei(0.2)}).should.be.rejectedWith('revert');

    let userBalance = await token.balanceOf(user);
    userBalance.should.be.bignumber.equal(rate * web3.toWei(0.8));

    let eth_after = await web3.eth.getBalance(wallet);
    assert.equal(eth_after.minus(eth_before).toNumber(), web3.toWei(0.8));
  });

  it('should not allow to buy new token when ICO contract is closed', async () => {
    await ico.addToWhiteList([user], web3.toWei(1));
    await ico.closeSale();
    await ico.sendTransaction({from: user, value: web3.toWei(0.5)}).should.be.rejectedWith('revert');
  });

  it('should not allow purchase when trying to buy too much token for the first day', async () => {
    await ico.addToWhiteList([user], web3.toWei(1));
    await ico.sendTransaction({from: user, value: web3.toWei(2)}).should.be.rejectedWith('revert');
  });

  it('should not allow purchase when trying to buy too much token for the second day', async () => {
    await ico.addToWhiteList([user], web3.toWei(1));;
    await increaseTime(duration.days(1) + duration.seconds(10));
    await ico.sendTransaction({from: user, value: web3.toWei(2.1)}).should.be.rejectedWith('revert');
  });

  it('should not allowed user to transfer token during ICO sales period', async () => {
    await ico.addToWhiteList([user], web3.toWei(1));
    increaseTime(duration.days(1) + duration.seconds(10));
    await ico.sendTransaction({from: user, value: web3.toWei(1)}).should.be.fulfilled;
    await token.transfer(otherUser, web3.toWei(1), {from: user}).should.be.rejectedWith('revert');
  });

  it('should allowed user to transfer token after ICO sales period', async () => {
    await ico.addToWhiteList([user], web3.toWei(1));
    await increaseTime(duration.days(1) + duration.seconds(10));
    await ico.sendTransaction({from: user, value: web3.toWei(1)});
    await ico.closeSale();
    await token.activate();
    await token.transfer(otherUser, web3.toWei(10), {from: user}).should.be.fulfilled;
  });

  it('should transfer the remaining balance to the new owner after saleClosed', async () => {
    await ico.addToWhiteList([user], web3.toWei(1));
    await increaseTime(duration.days(1) + duration.seconds(10));
    await ico.sendTransaction({from: user, value: web3.toWei(1)});
    await ico.closeSale();
    let result = await token.balanceOf(web3.eth.coinbase);
    assert.equal(result.toNumber(), new BigNumber(web3.toWei(1000000000)).sub(web3.toWei(10)).toNumber());
  });

  it('should have total token supply equal to weiRaised * rate before sale close' ,async () => {
    await ico.addToWhiteList([user], web3.toWei(3));
    await increaseTime(duration.days(1) + duration.seconds(10));
    await ico.sendTransaction({from: user, value: web3.toWei(3)});
    let result = await token.totalSupply();
    assert.equal(result.toNumber(), web3.toWei(30));
  });

  it('should have reach total token supply after sale close' ,async () => {
    await ico.closeSale();
    let result = await token.totalSupply();
    assert.equal(result.toNumber(), web3.toWei(1000000000));
  });


})
