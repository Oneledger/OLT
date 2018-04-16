var OneledgerToken = artifacts.require('./OneledgerToken.sol');
var ICO = artifacts.require("ICO");
const {increaseTime, latestTime, duration} = require('./timeIncrease')(web3);
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('ICO Initialize', function([tokenOwner, wallet, user, nonaddToWhiteListUser]) {
  let token = null
  let ico  = null;
  beforeEach(async ()=>{
    token = await OneledgerToken.new();
    await token.activate();
  });
  it('should be failed if rate is negative', async () => {
    await ICO.new(wallet,token.address, 0).should.be.rejectedWith('revert');
  });
  it('should be failed if wallet address is 0', async () => {
    await ICO.new(0,token.address, 10).should.be.rejectedWith('revert');
  });
  it('should be failed if wallet address is 0', async () => {
    await ICO.new(wallet,0, 10).should.be.rejectedWith('revert');
  })
})
