pragma solidity 0.4.21;

import "./OneledgerToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title TimeLock
 * @dev A contract responsible for deposit timelocked tokens for users
 */
contract TimeLock is Ownable {
  OneledgerToken token;

  event DepositWithTimeLock(address user,
    uint256 depositToken,
    uint256 startingFrom,
    uint256 period,
    uint256 releaseTokenPerPeriod);


  /**
    * @dev constructor
    * @param token_ OneldgerToken
  */
  function TimeLock(OneledgerToken token_) public {
      token = token_;
  }

  /**
  * @dev depsit token with time lock condition
  * param user_ address the user to depsit money to
  * param depositToken_ int the amount of token desposit to
  */
  function deposit(address user_,
    uint256 depositToken_,
    uint256 startingFrom_,
    uint256 period_,
    uint256 releaseTokenPerPeriod_
    ) public onlyOwner returns (bool){
    require(depositToken_ > 0);
    require(releaseTokenPerPeriod_ > 0);
    require(depositToken_ > releaseTokenPerPeriod_);

    uint256 unReleasedToken = depositToken_;
    uint256 duration = startingFrom_;
    while (unReleasedToken > releaseTokenPerPeriod_) {
      token.addLocker(user_, duration, releaseTokenPerPeriod_);
      unReleasedToken -= releaseTokenPerPeriod_;
      duration += period_;
    }
    token.addLocker(user_, duration, unReleasedToken);
    token.transfer(user_, depositToken_);
    DepositWithTimeLock(user_, depositToken_, startingFrom_, period_, releaseTokenPerPeriod_);
    return true;
  }
}
