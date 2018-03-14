var OneledgerToken = artifacts.require('./OneledgerToken.sol');
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('OneledgerTokenWithTimeLock', ([owner,spender,user1,user2])=>{
  let token = null
  beforeEach(async ()=>{
    token = await OneledgerToken.new();
    await token.active(); //first to active the token
    await token.transfer(user1, 1000,{from: owner});
    await token.approve(spender,100, {from: user1});
  });
  it('should lock the token if I add the user to the time lock list', async () => {
    await token.addLocker(user1, 1024, 100);
    await token.transfer(user2,100, {from: user1}).should.be.rejectedWith('revert');
  });

})
