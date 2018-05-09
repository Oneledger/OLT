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

  beforeEach(async ()=>{
  });
  it('should reject if all weiRaised exceeds the weiCap', async () => {
    let ico = await ICO.new(wallet, 10, latestTime(), web3.toWei(10));
    await increaseTime(duration.days(4) + duration.seconds(10));
    await ico.addToWhiteList([user], web3.toWei(8));
    await ico.addToWhiteList([otherUser], web3.toWei(8));
    await ico.sendTransaction({from: otherUser, value: web3.toWei(8)}).should.be.fulfilled;
    await ico.sendTransaction({from: user, value: web3.toWei(8)}).should.be.rejectedWith('revert');
    await ico.sendTransaction({from: user, value: web3.toWei(3)}).should.be.rejectedWith('revert');
    await ico.sendTransaction({from: user, value: web3.toWei(2)}).should.be.fulfilled;
    await ico.sendTransaction({from: user, value: web3.toWei(0.1)}).should.be.rejectedWith('revert');
  });
  it('should reject any purchase if starting date is later than purchase date', async()=>{
    let ico = await ICO.new(wallet, 10, latestTime() + duration.days(7), web3.toWei(10));
    await ico.sendTransaction({from: user, value: web3.toWei(10)}).should.be.rejectedWith('revert');
  });

  it('should allow purchase if starting date is earlier than purchase date', async()=>{
    let ico = await ICO.new(wallet, 10, latestTime() + duration.days(7), web3.toWei(1));
    await ico.addToWhiteList([user], web3.toWei(0.5));
    await increaseTime(duration.days(7) + duration.seconds(10));
    await ico.sendTransaction({from: user, value: web3.toWei(0.4)}).should.be.fulfilled;
  });
});
