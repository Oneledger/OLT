var OneledgerToken = artifacts.require('./OneledgerToken.sol');
var ICO = artifacts.require("ICO");
const {increaseTime, latestTime, duration} = require('./timeIncrease')(web3);
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('ICO', function([tokenOwner, wallet, user, nonWhiteListUser]) {
  let token = null
  let ico  = null;
  beforeEach(async ()=>{
    token = await OneledgerToken.new();
    ico = await ICO.new(wallet,token.address, 10);
    token.transfer(ico.address, 100000000000000); //ICO contract will hold the token and walletOwner will receive eth
    await token.activate();
  });
  it('should not be able to buy token, since user is not in the whitelist', async () => {
    let eth_before = await web3.eth.getBalance(wallet);
    let eth_after = await web3.eth.getBalance(wallet);
    await ico.sendTransaction({from: user, value: 10000000000000}).should.be.rejectedWith('revert');
    assert.equal(eth_after.minus(eth_before), 0);
    // let balance = await token.balanceOf(user);
    // assert.equal(balance, 100000000000000);
    // let eth_after = await web3.eth.getBalance(wallet);
    // assert.equal(eth_after.minus(eth_before), 10000000000000);
  });
  it('should be able to buy token when the user was added in the whitelist', async () => {
    await ico.whiteList(0,[user],100000000);
    let eth_before = await web3.eth.getBalance(wallet);
    await ico.sendTransaction({from: user, value: 100000000}).should.be.fulfilled;
    await ico.sendTransaction({from: user, value: 100000000}).should.be.rejectedWith('revert');
    let eth_after = await web3.eth.getBalance(wallet);
    assert.equal(eth_after.minus(eth_before), 100000000);
  });
  it('should be able to buy token when the user was added in the whitelist, the second day buy double', async () => {
    await ico.whiteList(0,[user],100000000);
    let eth_before = await web3.eth.getBalance(wallet);
    await ico.sendTransaction({from: user, value: 100000000}).should.be.fulfilled;
    await ico.sendTransaction({from: user, value: 100000000}).should.be.rejectedWith('revert');
    await increaseTime(duration.days(1) + duration.seconds(10));
    await ico.sendTransaction({from: user, value: 200000000}).should.be.fulfilled;
    await ico.sendTransaction({from: user, value: 200000000}).should.be.rejectedWith('revert');
    let eth_after = await web3.eth.getBalance(wallet);
    assert.equal(eth_after.minus(eth_before), 300000000);
  });
  it('should be able to buy token when the user was added in the whitelist, the second day buy double, the third day free for all', async () => {
    await ico.whiteList(0,[user],100000000);
    let eth_before = await web3.eth.getBalance(wallet);
    await ico.sendTransaction({from: user, value: 100000000}).should.be.fulfilled;
    await ico.sendTransaction({from: user, value: 100000000}).should.be.rejectedWith('revert');
    await increaseTime(duration.days(1) + duration.seconds(10));
    await ico.sendTransaction({from: user, value: 200000000}).should.be.fulfilled;
    await ico.sendTransaction({from: user, value: 200000000}).should.be.rejectedWith('revert');
    await increaseTime(duration.days(1) + duration.seconds(10));
    await ico.sendTransaction({from: user, value: 300000000}).should.be.fulfilled;
    await ico.sendTransaction({from: user, value: 100000000}).should.be.fulfilled;
    await ico.sendTransaction({from: nonWhiteListUser, value: 200000000}).should.be.rejectedWith('revert');

    let eth_after = await web3.eth.getBalance(wallet);
    assert.equal(eth_after.minus(eth_before), 700000000);
  });
})
