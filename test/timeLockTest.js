var OneledgerToken = artifacts.require('./OneledgerToken.sol');
var TimeLock = artifacts.require("TimeLock");
const {increaseTime, latestTime, duration} = require('./timeIncrease')(web3);
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('TimeLock', function([owner,user1, user2, spender]){
  let token = null
  let timeLock  = null;
  const expectedTotalSupply = 100000000 * (10 ** 18);
  beforeEach(async ()=>{
    token = await OneledgerToken.new();
    timeLock = await TimeLock.new(token.address);
    await token.active();
  });
  it('has an owner',async ()=>{
    assert.equal(await token.owner(), owner);
  });
  it('should be able to schedule a time locker', async ()=>{
    await timeLock.setSchedule(user1, 1000, duration.weeks(8), duration.weeks(4), 300);
    await token.transfer(user1, 1000);
    await token.transfer(user2, 100,{from: user1}).should.be.rejectedWith('revert');

    await increaseTime(duration.weeks(8) + duration.days(1));
    await token.transfer(user2, 300,{from: user1}).should.be.fulfilled;
    await token.transfer(user2, 100,{from: user1}).should.be.rejectedWith('revert');
    await increaseTime(duration.weeks(4) + duration.days(1));
    await token.transfer(user2, 300,{from: user1}).should.be.fulfilled;
    await token.transfer(user2, 100,{from: user1}).should.be.rejectedWith('revert');
    await increaseTime(duration.weeks(4) + duration.days(1));
    await token.transfer(user2, 300,{from: user1}).should.be.fulfilled;
    await token.transfer(user2, 100,{from: user1}).should.be.rejectedWith('revert');
    await increaseTime(duration.weeks(4) + duration.days(1));
    await token.transfer(user2, 100,{from: user1}).should.be.fulfilled;
  });
})
