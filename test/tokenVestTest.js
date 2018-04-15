var OneledgerToken = artifacts.require('./OneledgerToken.sol');
var OneledgerTokenVesting = artifacts.require('./OneledgerTokenVesting.sol');
const {increaseTime, latestTime, duration} = require('./timeIncrease')(web3);
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('OneledgerToken', function([owner,vestingOwner, beneficiary]){
  let token = null;
  let vesting = null;
  const expectedTotalSupply = 100000000 * (10 ** 18);
  beforeEach(async ()=>{
    token = await OneledgerToken.new();
    this.start = latestTime() + duration.minutes(1); // +1 minute so it starts after contract instantiation
    this.cliff = duration.years(1);
    this.duration = duration.years(2)

    vesting = await OneledgerTokenVesting.new(beneficiary, latestTime() + duration.weeks(2),
                                              duration.weeks(4), 10000, true,{from: vestingOwner});

    await token.activate();
    await token.transfer(vesting.address, 10000 * 4 + 2000);
  });

  it('should not release token before the starting date',async ()=>{
    await vesting.release(token.address).should.be.rejectedWith('revert');
  });
  it('should only release once after the starting date and before the next release date', async () => {
    await increaseTime(duration.weeks(2) + duration.weeks(4) + duration.days(2));
    await vesting.release(token.address).should.be.fulfilled;
    await vesting.release(token.address).should.be.rejectedWith('revert');
    assert.equal( await token.balanceOf(beneficiary), 10000);
  });
  it('should only release twice after the starting date and before the next release date', async () => {
    await increaseTime(duration.weeks(2) + duration.weeks(4) * 2 + duration.days(2));
    await vesting.release(token.address).should.be.fulfilled;
    await vesting.release(token.address).should.be.rejectedWith('revert');
    assert.equal( await token.balanceOf(beneficiary), 20000);
  });
  it('should be able to be revoked by the owner' ,async () => {
    await increaseTime(duration.weeks(2) + duration.weeks(4) * 2 + duration.days(2));
    await vesting.release(token.address);
    vesting.revoke(token.address,{from : vestingOwner});
    await increaseTime(duration.weeks(5));
    await vesting.release(token.address).should.be.rejectedWith('revert');
    assert.equal( await token.balanceOf(vestingOwner), 22000);
  })
})
