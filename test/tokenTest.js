var OneledgerToken = artifacts.require('./OneledgerToken.sol');
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('OneledgerToken', function([owner,investor1, investor2, spender]){
  let token = null
  const expectedTotalSupply = 100000000 * (10 ** 18);
  beforeEach(async ()=>{
    token = await OneledgerToken.new();
    await token.mint(owner, 100000000 * (10 ** 18));
    await token.activate();
  });
  it('has an owner',async ()=>{
    assert.equal(await token.owner(), owner);
  });
  it('should has total supply of 100000000 * (10 ** decimals) from the contract', async ()=>{
      const totalSupply = await token.totalSupply();
      assert(totalSupply, expectedTotalSupply);
  });
  it('should be able to transfer the token to the user', async () => {
    await token.transfer(investor1, 1000);
    assert.equal(await token.balanceOf(investor1), 1000);
    assert.equal(await token.balanceOf(owner), expectedTotalSupply - 1000);
  });
  it('should be able to transferFrom the token from one user to another user', async ()=>{
    await token.transfer(investor1, 1000);
    assert.equal(await token.balanceOf(investor1), 1000);
    await token.approve(spender, 100, {from: investor1});
    await token.transferFrom(investor1, investor2, 100, {from: spender});
    assert.equal(await token.balanceOf(investor1), 900);
    assert.equal(await token.balanceOf(investor2), 100);
  });
  it('should failed transferFrom the token from one user to another user with no approve', async ()=>{
    await token.transfer(investor1, 1000);
    await token.transferFrom(investor1, investor2, 100, {from: spender}).should.be.rejectedWith('revert');
  });
  it('should be able to transfer multiple times', async ()=>{
    await token.transfer(investor1, 1000);
    await token.transfer(investor2, 500, {from: investor1}).should.be.fulfilled;
    await token.transfer(investor2, 400, {from: investor1}).should.be.fulfilled;
  });

})
