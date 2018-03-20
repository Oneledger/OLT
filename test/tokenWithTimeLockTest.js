var OneledgerToken = artifacts.require('./OneledgerToken.sol');
const {increaseTime, latestTime, duration} = require('./timeIncrease')(web3);
const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('OneledgerTokenWithTimeLock', ([owner,spender,user1,user2,user3])=>{
  let token = null
  beforeEach(async ()=>{
    token = await OneledgerToken.new();
    await token.active(); //first to active the token
    await token.transfer(user1, 1000,{from: owner});
    await token.approve(spender,1000, {from: user1});
    await token.setTimelockKeeper(owner);
  });
  it('should lock the token if I add the user to the time lock list', async () => {
    await token.addLocker(user1, 1024, 1000);
    await token.transfer(user2,100, {from: user1}).should.be.rejectedWith('revert');
    await token.transferFrom(user1, user2,100, {from: spender}).should.be.rejectedWith('revert');
  });
  it('should be able to transfer 1000 after lock expired', async ()=>{
    await token.addLocker(user1, duration.weeks(1), 1000);
    await increaseTime(duration.weeks(1) + duration.days(1));
    await token.transfer(user2, 400 , {from: user1}).should.be.fulfilled;
    await token.transfer(user2, 300 , {from: user1}).should.be.fulfilled;
    await token.transferFrom(user1, user2, 300 , {from: spender}).should.be.fulfilled;
  });
  it('should be able to release the token based on schedule', async () => {
    await token.addLocker(user1, duration.weeks(4), 300); //after 4 weeks, release 300 token
    await token.addLocker(user1, duration.weeks(8), 300); //after 8 weeks, release 300 token
    await token.addLocker(user1, duration.weeks(12), 400); //after 12 weeks, release 400 token
    // after that all tokens are released

    await token.transfer(user2, 100,{from: user1}).should.be.rejectedWith('revert');

    await increaseTime(duration.weeks(4) + duration.days(1));
    await token.transfer(user2, 300,{from: user1}).should.be.fulfilled;
    await token.transfer(user2, 100,{from: user1}).should.be.rejectedWith('revert');
    await increaseTime(duration.weeks(4) + duration.days(1));
    await token.transfer(user2, 300,{from: user1}).should.be.fulfilled;
    await token.transfer(user2, 100,{from: user1}).should.be.rejectedWith('revert');
    await increaseTime(duration.weeks(4) + duration.days(1));
    await token.transfer(user2, 400,{from: user1}).should.be.fulfilled;
  })

})
