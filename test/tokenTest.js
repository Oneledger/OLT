var OneledgerToken = artifacts.require('./OneledgerToken.sol')

contract('OneledgerToken', function([owner]){
  let token = null
  beforeEach(async ()=>{
    token = await OneledgerToken.deployed()
  })
  it('has an owner',async ()=>{
    assert.equal(await token.owner(), owner);
  })
  it("should has total supply of 100000000 * (10 ** decimals) from the contract", async ()=>{
      const totalSupply = await token.totalSupply();
      assert(totalSupply, 100000000 * (10 ** 18));
  })
})
