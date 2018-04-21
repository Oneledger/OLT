pragma solidity 0.4.21;

import "./OneledgerToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";


contract OneledgerTokenVesting is Ownable {
    using SafeMath for uint256;

    event Released(uint256 amount);

    // beneficiary of tokens after they are released
    address public beneficiary;

    uint256 public startFrom;
    uint256 public period;
    uint256 public tokenReleasedPerPeriod;

    uint256 public elapsedPeriods;

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
    ) public {
        require(_beneficiary != address(0));
        require(_startFrom >= now);

        beneficiary = _beneficiary;
        startFrom = _startFrom;
        period = _period;
        tokenReleasedPerPeriod = _tokenReleasedPerPeriod;
        revocable = _revocable;
        elapsedPeriods = 0;
    }

    /**
     * @dev release
     * param _token Oneledgertoken that will be released to beneficiary
     */
    function release(OneledgerToken token) public {
        require(token.balanceOf(this) >= 0 && now >= startFrom);
        uint256 amountToTransfer;
        uint256 periodsInCurrentRelease;
        (amountToTransfer, periodsInCurrentRelease) = releasableAmount(token);
        require(amountToTransfer > 0);
        elapsedPeriods = elapsedPeriods.add(periodsInCurrentRelease);
        token.transfer(beneficiary, amountToTransfer);
        Released(amountToTransfer);
    }

     /**
      * @dev releasableAmount the amount that can be released
      * param token Oneledger token which is being vested
      */
    function releasableAmount(OneledgerToken token) public view returns (uint256, uint256) {
        uint256 elapsedTime = now.sub(startFrom);
        uint256 periodsInCurrentRelease = elapsedTime.div(period).sub(elapsedPeriods);
        uint256 availableBalance = token.balanceOf(this);
        uint256 tokenReadyToRelease = periodsInCurrentRelease.mul(tokenReleasedPerPeriod);
        if (tokenReadyToRelease >= availableBalance) {
            return (availableBalance, periodsInCurrentRelease);
        } else {
            return (tokenReadyToRelease, periodsInCurrentRelease);
        }
    }
}
