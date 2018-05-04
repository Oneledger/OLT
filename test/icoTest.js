var OneledgerToken = artifacts.require('OneledgerToken.sol');
var OneledgerTokenVesting = artifacts.require('./OneledgerTokenVesting.sol');
var ICO = artifacts.require("ICO");
const {increaseTime, latestTime, duration} = require('./timeIncrease')(web3);
const {tokener,ether} = require('./tokener');
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();



contract('ICO', function([wallet, user, nonaddToWhiteListUser,otherUser,newOwner, beneficiary]) {

  let ico;
  let token;

  beforeEach(async ()=>{
    ico = await ICO.new(wallet,10,latestTime() + duration.days(1), ether(10000));
    token =await OneledgerToken.at(await ico.token());
  });

  it('should be able to mint new token for vesting contract', async () => {
    let vesting = await OneledgerTokenVesting.new(beneficiary, latestTime(),duration.weeks(4), tokener(10));
    await ico.mintTokenToNewAddress(vesting.address, tokener(120)).should.be.fulfilled;
  })

  it('should not be able to buy token, since user is not in the addToWhiteList', async () => {
    let eth_before = await web3.eth.getBalance(wallet);
    let eth_after = await web3.eth.getBalance(wallet);
    await increaseTime(duration.days(1) + duration.seconds(1));
    await ico.sendTransaction({from: user, value: ether(4)}).should.be.rejectedWith('revert');
    assert.equal(eth_after.minus(eth_before), 0);
  });
  it('should be able to buy token when the user was added in the addToWhiteList', async () => {
    await ico.addToWhiteList([user],ether(1));
    await increaseTime(duration.days(1) + duration.seconds(1));
    let eth_before = await web3.eth.getBalance(wallet);
    await ico.sendTransaction({from: user, value: ether(1)}).should.be.fulfilled;
    await ico.sendTransaction({from: user, value: ether(1)}).should.be.rejectedWith('revert');
    let eth_after = await web3.eth.getBalance(wallet);
    assert.equal(eth_after.minus(eth_before), ether(1));
  });
  it('should be able to buy token when the user was added in the addToWhiteList, the second day buy double', async () => {
    await ico.addToWhiteList([user],ether(1));
    let eth_before = await web3.eth.getBalance(wallet);
    await increaseTime(duration.days(1) + duration.seconds(1));
    await ico.sendTransaction({from: user, value: ether(1)}).should.be.fulfilled;
    await ico.sendTransaction({from: user, value: ether(1)}).should.be.rejectedWith('revert');
    await increaseTime(duration.days(1)+duration.seconds(1));
    await ico.sendTransaction({from: user, value: ether(3)}).should.be.rejectedWith('revert');
    await ico.sendTransaction({from: user, value: ether(2)}).should.be.fulfilled;
    await ico.sendTransaction({from: user, value: ether(2)}).should.be.rejectedWith('revert');
    let eth_after = await web3.eth.getBalance(wallet);
    assert.equal(eth_after.minus(eth_before), ether(3));
  });
  it('should be able to buy token when the user was added in the addToWhiteList, the second day buy double, the third day free for all', async () => {
    await ico.addToWhiteList([user],ether(1));
    let eth_before = await web3.eth.getBalance(wallet);
    await increaseTime(duration.days(1) + duration.seconds(1));
    await ico.sendTransaction({from: user, value: ether(0.1)}).should.be.fulfilled;
    await ico.sendTransaction({from: user, value: ether(0.1)}).should.be.rejectedWith('revert');
    await increaseTime(duration.days(1) + duration.seconds(10));
    await ico.sendTransaction({from: user, value: ether(0.2)}).should.be.fulfilled;
    await ico.sendTransaction({from: user, value: ether(0.2)}).should.be.rejectedWith('revert');
    await increaseTime(duration.days(1) + duration.seconds(10));
    await ico.sendTransaction({from: user, value: ether(0.4)}).should.be.fulfilled;
    await ico.sendTransaction({from: user, value: ether(0.3)}).should.be.rejectedWith('revert');//one day one purchase
    await increaseTime(duration.days(1) + duration.seconds(10));
    await ico.sendTransaction({from: user, value: ether(0.1)}).should.be.fulfilled;
    await ico.sendTransaction({from: nonaddToWhiteListUser, value: ether(0.2)}).should.be.rejectedWith('revert');

    let eth_after = await web3.eth.getBalance(wallet);
    assert.equal(eth_after.minus(eth_before).toNumber(), ether(0.8));
  });
  it('should not allow to buy new token when ICO contract is closed', async () => {
    await ico.addToWhiteList([user],ether(1));
    await ico.closeSale(newOwner);
    await ico.sendTransaction({from: user, value: ether(0.5)}).should.be.rejectedWith('revert');
  });
  it('should not allow purchase when trying to buy too much token for the first day', async () => {
    await ico.addToWhiteList([user],ether(1));
    await ico.sendTransaction({from: user, value: ether(2)}).should.be.rejectedWith('revert');
  });
  it('should not allow purchase when trying to buy too much token for the second day', async () => {
    await ico.addToWhiteList([user],ether(1));;
    await increaseTime(duration.days(1) + duration.seconds(10));
    await ico.sendTransaction({from: user, value: ether(2.1)}).should.be.rejectedWith('revert');
  });
  it('should reject any purchase if starting date is later than purchase date', async()=>{
    let ico2 = await ICO.new(wallet,10,latestTime()+ duration.days(7),ether(10));
    await ico2.sendTransaction({from: user, value: ether(10)}).should.be.rejectedWith('revert');
  });
  it('should allow purchase if starting date is ealier than purchase date', async()=>{
    let ico2 = await ICO.new(wallet,10,latestTime()+ duration.days(7),ether(1));
    await ico2.addToWhiteList([user],ether(0.5));
    await increaseTime(duration.days(7) + duration.seconds(10));
    await ico2.sendTransaction({from: user, value: ether(0.4)}).should.be.fulfilled;
  });
  it('should not allowed user to transfer token during ICO sales period', async () => {
    await ico.addToWhiteList([user],ether(1));
    increaseTime(duration.days(1) + duration.seconds(10));
    await ico.sendTransaction({from: user, value: ether(1)}).should.be.fulfilled;
    await token.transfer(otherUser, tokener(1), {from: user}).should.be.rejectedWith('revert');
  });
  it('should allowed user to transfer token after ICO sales period', async () => {
    await ico.addToWhiteList([user],ether(1));
    await increaseTime(duration.days(1) + duration.seconds(10));
    await ico.sendTransaction({from: user, value: ether(1)});
    await ico.closeSale(newOwner);
    await token.activate({from:newOwner});
    await token.transfer(otherUser, tokener(10), {from: user}).should.be.fulfilled;
  });
  it('should transfer the left balance to the new owner after saleClosed', async () => {
    await ico.addToWhiteList([user],ether(1));
    await increaseTime(duration.days(1) + duration.seconds(10));
    await ico.sendTransaction({from: user, value: ether(1)});
    await ico.closeSale(newOwner);
    let result = await token.balanceOf(newOwner);
    assert.equal(result.toNumber(), new BigNumber(tokener(1000000000)).sub(tokener(10)).toNumber());
  });
  it('should have total token supply equal to weiCap * rate before sale close' ,async () => {
    await ico.addToWhiteList([user],ether(3));
    await increaseTime(duration.days(1) + duration.seconds(10));
    await ico.sendTransaction({from: user, value: ether(3)});
    let result = await token.totalSupply();
    assert.equal(result.toNumber(), tokener(30));
  });
  it('should have reach total token supply after sale close' ,async () => {
    await ico.closeSale(newOwner);
    let result = await token.totalSupply();
    assert.equal(result.toNumber(), tokener(1000000000));
  });
  it('should reject if all weiRased is exceed the weiCap', async () => {
    let ico2 = await ICO.new(wallet,10,latestTime(), ether(10));
    await increaseTime(duration.days(4) + duration.seconds(10));
    await ico2.addToWhiteList([user],ether(8));
    await ico2.addToWhiteList([otherUser],ether(8));
    await ico2.sendTransaction({from: otherUser, value: ether(8)}).should.be.fulfilled;
    await ico2.sendTransaction({from: user, value: ether(8)}).should.be.rejectedWith('revert');
  })
})
