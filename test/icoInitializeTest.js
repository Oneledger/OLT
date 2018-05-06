var OneledgerToken = artifacts.require('./OneledgerToken.sol');
var ICO = artifacts.require("ICO");
const {increaseTime, latestTime, duration} = require('./timeIncrease')(web3);
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('ICO Initialize', function([tokenOwner, wallet, user, nonaddToWhiteListUser]) {

  it('should fail if rate is negative', async () => {
    await ICO.new(wallet, 0, latestTime(), 100000000000000).should.be.rejectedWith('revert');
  });

  it('should fail if wallet address is 0', async () => {
    await ICO.new(0, 10, latestTime(), 100000000000000).should.be.rejectedWith('revert');
  });

  it('should fail if weiCap is too huge', async () => {
    await ICO.new(wallet, 10, latestTime(), web3.toWei(100000001)).should.be.rejectedWith('revert');
  });

})
