pragma solidity 0.4.23;

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
    uint256 public tokensReleasedPerPeriod;

    uint256 public elapsedPeriods;

    /**
     * @dev Creates a vesting contract for OneledgerToken
     * @param _beneficiary address of the beneficiary to whom vested tokens are transferred
     * @param _startFrom Datetime when the vesting will begin
     * @param _period The preiod to release the token
     * @param _tokensReleasedPerPeriod the token to release per period
     */
    function OneledgerTokenVesting(
        address _beneficiary,
        uint256 _startFrom,
        uint256 _period,
        uint256 _tokensReleasedPerPeriod
    ) public {
        require(_beneficiary != address(0));
        require(_startFrom >= now);

        beneficiary = _beneficiary;
        startFrom = _startFrom;
        period = _period;
        tokensReleasedPerPeriod = _tokensReleasedPerPeriod;
        elapsedPeriods = 0;
    }

    /**
     * @dev release
     * param _token Oneledgertoken that will be released to beneficiary
     */
    function release(OneledgerToken token) public {
        require(token.balanceOf(this) >= 0 && now >= startFrom);
        uint256 elapsedTime = now.sub(startFrom);
        uint256 periodsInCurrentRelease = elapsedTime.div(period).sub(elapsedPeriods);
        uint256 tokensReadyToRelease = periodsInCurrentRelease.mul(tokensReleasedPerPeriod);
        uint256 amountToTransfer = tokensReadyToRelease > token.balanceOf(this) ? token.balanceOf(this) : tokensReadyToRelease;
        require(amountToTransfer > 0);
        elapsedPeriods = elapsedPeriods.add(periodsInCurrentRelease);
        token.transfer(beneficiary, amountToTransfer);
        emit Released(amountToTransfer);
    }
}
