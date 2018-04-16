pragma solidity 0.4.21;
import "./OneledgerToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract OneledgerTokenVesting is Ownable{
  using SafeMath for uint256;

  event Released(uint256 amount);
  event Revoked();

  // beneficiary of tokens after they are released
  address public beneficiary;

  uint256 public startFrom;
  uint256 public period;
  uint256 public tokenReleasedPerPeriod;

  uint256 private numberOfReleased_;

  bool public revocable;

  /**
   * @dev Creates a vesting contract for OneledgerToken
   * @param _beneficiary address of the beneficiary to whom vested tokens are transferred
   * @param _startFrom Datetime when the vesting will begin
   * @param _period The preiod to release the token
   * @param _tokenReleasedPerPeriod the token to release per period
   * @param _revocable whether the vesting is revocable or not
   */
  function OneledgerTokenVesting(
    address _beneficiary,
    uint256 _startFrom,
    uint256 _period,
    uint256 _tokenReleasedPerPeriod,
    bool _revocable
  )
    public
  {
    require(_beneficiary != address(0));
    require(_startFrom >= now);

    beneficiary = _beneficiary;
    startFrom = _startFrom;
    period = _period;
    tokenReleasedPerPeriod = _tokenReleasedPerPeriod;
    revocable = _revocable;
    numberOfReleased_ =  0;
  }

  /**
   *@dev release
   *param _token Oneledgertoken that will be released to beneficiary
   */
   function release(OneledgerToken token) public {
     require(token.balanceOf(this) >=0
              && now >= startFrom);
     uint256 amountToTransfer;
     uint256 numberOfPeriod;
     (amountToTransfer, numberOfPeriod)  = releasableAmount(token);
     require(amountToTransfer > 0);
     token.transfer(beneficiary, amountToTransfer);
     numberOfReleased_ += numberOfPeriod;
     emit Released(amountToTransfer);
   }

   /**
    *@dev revoke Allows the owner to revoke the token that hasn't been transferred
    *param _token Onelegertoken
    */
    function revoke(OneledgerToken token) public onlyOwner {
      require(revocable);
      uint256 availableBalance = token.balanceOf(this);
      require(availableBalance > 0);
      token.transfer(owner, availableBalance);
      emit Revoked();
    }

    /**
     *@dev releasableAmount the amount that can be released
     *param token Oneledger token which is being vested
     */
     function releasableAmount(OneledgerToken token) public view returns (uint256, uint256) {
       uint256 timeFrame = now - startFrom;
       uint256 numberOfPeriod = timeFrame / period - numberOfReleased_;
       uint256 availableBalance = token.balanceOf(this);
       uint256 tokenReadyToRelease = numberOfPeriod * tokenReleasedPerPeriod;
       if (tokenReadyToRelease >= availableBalance) {
         return (availableBalance, numberOfPeriod);
       } else {
         return (tokenReadyToRelease, numberOfPeriod);
       }
     }
}
