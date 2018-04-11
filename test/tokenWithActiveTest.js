var OneledgerToken = artifacts.require('./OneledgerToken.sol');
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('OneledgerTokenWithActive', ([owner,spender,user1,user2])=>{
  let token = null
  beforeEach(async ()=>{
    token = await OneledgerToken.new()
  });
  it('should allow owner to transfer the token when contract first created (by default locked)', async ()=>{
    await token.transfer(user1, 1000,{from: owner}).should.be.fulfilled;
  });
  it('should not allow other user to transfer the token when contract is locked', async () => {
    await token.transfer(user1, 1000,{from: owner}); //initial some token;
    await token.transfer(user2, 50, {from: user1}).should.be.rejectedWith('revert');
  });
  it('should not allow spender to transfer the token when contract first created (by default locked)', async ()=>{
    await token.transfer(user1, 1000,{from: owner}); //even locked, contract owner can still transfer the token to the user
    await token.approve(spender,100, {from: user1}); //approve spender to be able to transfer the token
    await token.transferFrom(user1, user2, 100,{from:spender}).should.be.rejectedWith('revert');
  });
  it('should only allow owner to activate the token contract', async () => {
    await token.activate({from: user1}).should.be.rejectedWith('revert');
    await token.activate();
    assert.equal(await token.active(), true);
  });
  it('should be able to do the transfer/transferFrom after the token is activated', async () => {
    await token.transfer(user1, 1000, {from: owner}); //even locked, contract owner can still transfer the token to the user
    await token.approve(spender, 100,{from: user1}); //approve spender to be able to transfer the token
    await token.activate();
    await token.transfer(user2, 50, {from: user1}).should.be.fulfilled;
    await token.transferFrom(user1, user2, 100, {from:spender}).should.be.fulfilled;
  });

})
