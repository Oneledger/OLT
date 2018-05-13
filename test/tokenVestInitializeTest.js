var OneledgerToken = artifacts.require('./OneledgerToken.sol');
var OneledgerTokenVesting = artifacts.require("./OneledgerTokenVesting.sol");
const {increaseTime, latestTime, duration} = require('./timeIncrease')(web3);
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('Token Vest Initialize', function([tokenOwner, user]) {
  let token = null
  beforeEach(async ()=>{
    token = await OneledgerToken.new();
    await token.mint(tokenOwner, 100000000 * (10 ** 18));
    await token.activate();
  });
  it('should be failed if beneficiary address is 0', async () => {
    await OneledgerTokenVesting.new(0, latestTime() + duration.weeks(2),
                                              duration.weeks(4), 10000, token.address)
                                              .should.be.rejectedWith('revert');
  });
  it('should be failed if starting date is earlier than current date', async () => {
    await OneledgerTokenVesting.new(user, latestTime() - 10,
                                              duration.weeks(4), 10000, token.address)
                                              .should.be.rejectedWith('revert');
  });
})
