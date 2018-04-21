var OneledgerToken = artifacts.require('./OneledgerToken.sol');
var ICO = artifacts.require("ICO");
const {increaseTime, latestTime, duration} = require('./timeIncrease')(web3);
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('ICO', function([tokenOwner, wallet, user, nonaddToWhiteListUser]) {

  let token;
  let ico;

  beforeEach(async ()=>{
    ico = await ICO.new(wallet,10,latestTime(), 100000000000000);
    token = await ico.token();
  });

  it('should not be able to buy token, since user is not in the addToWhiteList', async () => {
    let eth_before = await web3.eth.getBalance(wallet);
    let eth_after = await web3.eth.getBalance(wallet);
    await ico.sendTransaction({from: user, value: 10000000000000}).should.be.rejectedWith('revert');
    assert.equal(eth_after.minus(eth_before), 0);
  });
  it('should be able to buy token when the user was added in the addToWhiteList', async () => {
    await ico.addToWhiteList([user],100000000);
    let eth_before = await web3.eth.getBalance(wallet);
    await ico.sendTransaction({from: user, value: 100000000}).should.be.fulfilled;
    await ico.sendTransaction({from: user, value: 100000000}).should.be.rejectedWith('revert');
    let eth_after = await web3.eth.getBalance(wallet);
    assert.equal(eth_after.minus(eth_before), 100000000);
  });
  it('should be able to buy token when the user was added in the addToWhiteList, the second day buy double', async () => {
    await ico.addToWhiteList([user],100000000);
    let eth_before = await web3.eth.getBalance(wallet);
    await ico.sendTransaction({from: user, value: 100000000}).should.be.fulfilled;
    await ico.sendTransaction({from: user, value: 100000000}).should.be.rejectedWith('revert');
    await increaseTime(duration.days(1) + duration.seconds(10));
    await ico.sendTransaction({from: user, value: 200000000}).should.be.fulfilled;
    await ico.sendTransaction({from: user, value: 200000000}).should.be.rejectedWith('revert');
    let eth_after = await web3.eth.getBalance(wallet);
    assert.equal(eth_after.minus(eth_before), 300000000);
  });
  it('should be able to buy token when the user was added in the addToWhiteList, the second day buy double, the third day free for all', async () => {
    await ico.addToWhiteList([user],100000000);
    let eth_before = await web3.eth.getBalance(wallet);
    await ico.sendTransaction({from: user, value: 100000000}).should.be.fulfilled;
    await ico.sendTransaction({from: user, value: 100000000}).should.be.rejectedWith('revert');
    await increaseTime(duration.days(1) + duration.seconds(10));
    await ico.sendTransaction({from: user, value: 200000000}).should.be.fulfilled;
    await ico.sendTransaction({from: user, value: 200000000}).should.be.rejectedWith('revert');
    await increaseTime(duration.days(1) + duration.seconds(10));
    await ico.sendTransaction({from: user, value: 300000000}).should.be.fulfilled;
    await ico.sendTransaction({from: user, value: 100000000}).should.be.rejectedWith('revert');//one day one purchase
    await increaseTime(duration.days(1) + duration.seconds(10));
    await ico.sendTransaction({from: user, value: 100000000}).should.be.fulfilled;
    await ico.sendTransaction({from: nonaddToWhiteListUser, value: 200000000}).should.be.rejectedWith('revert');

    let eth_after = await web3.eth.getBalance(wallet);
    assert.equal(eth_after.minus(eth_before), 700000000);
  });
  it('should not allow to buy new token when ICO contract is closed', async () => {
    await ico.addToWhiteList([user],100000000);
    await ico.closeSale();
    await ico.sendTransaction({from: user, value: 100000000}).should.be.rejectedWith('revert');
  });
  it('should not allow purchase when trying to buy too much token for the first day', async () => {
    await ico.addToWhiteList([user],100000000);
    await ico.sendTransaction({from: user, value: 1000000000}).should.be.rejectedWith('revert');
  });
  it('should not allow purchase when trying to buy too much token for the second day', async () => {
    await ico.addToWhiteList([user],100000000);
    await increaseTime(duration.days(1) + duration.seconds(10));
    await ico.sendTransaction({from: user, value: 200000001}).should.be.rejectedWith('revert');
  });
  it('should reject any purchase if starting date is later than purchase date', async()=>{
    let ico2 = await ICO.new(wallet,10,latestTime()+ duration.days(7),100000000);
    await ico2.sendTransaction({from: user, value: 100}).should.be.rejectedWith('revert');
  });
  it('should allow purchase if starting date is ealier than purchase date', async()=>{
    let ico2 = await ICO.new(wallet,10,latestTime()+ duration.days(7),100000000);
    await ico2.addToWhiteList([user],100000000);
    await increaseTime(duration.days(7) + duration.seconds(10));
    await ico2.sendTransaction({from: user, value: 100}).should.be.fulfilled;
  });
})
