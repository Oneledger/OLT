var OneledgerToken = artifacts.require('./OneledgerToken.sol');
var ICO = artifacts.require("ICO");
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('ICO', function([tokenOwner, wallet, user]) {
  let token = null
  let ico  = null;
  beforeEach(async ()=>{
    token = await OneledgerToken.new();
    ico = await ICO.new(wallet,token.address, 10);
    token.transfer(ico.address, 100000000000000); //ICO contract will hold the token and walletOwner will receive eth
    await token.active();
  });
  it('should be able to buy token', async () => {
    let eth_before = await web3.eth.getBalance(wallet);
    await ico.sendTransaction({from: user, value: 10000000000000}).should.be.fulfilled;
    let balance = await token.balanceOf(user);
    assert.equal(balance, 100000000000000);
    let eth_after = await web3.eth.getBalance(wallet);
    assert.equal(eth_after.minus(eth_before), 10000000000000);
  });
})
