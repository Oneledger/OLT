pragma solidity 0.4.21;

import "./ReleasePlanStruct.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

/**
* @title OneledgerToken
* @dev this is the oneledger token
*/
contract OneledgerToken is StandardToken, Ownable {
  using SafeMath for uint256;

  string public name = "Oneledger Token";
  string public symbol = "OLT";
  uint256 public decimals = 18;
  uint256 public INITIAL_SUPPLY = 100000000 * (10 ** decimals);
  address public timelockKeeper;
  bool public active;
  mapping (address => ReleasePlanStruct.ReleasePlan) internal releasePlanMap;

  /**
  * @dev control the token transfer to be controlled by time locker
  * @param from address the target address
  * @param value the total value needs to be allowed
  */
  modifier allowedByTimeLocker(address from, uint256 value) {
    ReleasePlanStruct.ReleasePlan storage rPlan = releasePlanMap[from];
    if(rPlan.initialized) {
      uint256 frozenTokens = 0;
      ReleasePlanStruct.TimeLocker[] storage timeLockers = rPlan.timeLockers;
      for (uint256 i = 0; i < timeLockers.length; i++) {
        ReleasePlanStruct.TimeLocker storage locker = timeLockers[i];
        if(locker.releaseTime >= now) {
          frozenTokens += locker.frozenTokens;
        }
      }
      require(balances[from] >= value + frozenTokens);
    }
    _;
  }

  /**
  * @dev restrict function to be callable only by timelockKeeper
  */
  modifier onlyTimelockKeeper() {
    require(msg.sender == timelockKeeper);
    _;
  }

  /**
  * @dev restrict function to be callable by the owner or when token is active
  */
  modifier onlyActiveOrOwner() {
    require(msg.sender == owner || active == true); // owner can call even when inactive
    _;
  }

  /**
  * @dev constructor
  */
  function OneledgerToken() public {
      totalSupply_ = INITIAL_SUPPLY;
      balances[msg.sender] = INITIAL_SUPPLY;
      active = false;
  }

  /**
  * @dev set the time lock keeper
  * @param keeper address the keeper's contract address
  */
  function setTimelockKeeper(address keeper) public onlyOwner {
    timelockKeeper = keeper;
  }

  /**
  * @dev addLocker add the time lock for the user
  * @param from address
  * @param duration uint256
  * @param frozenToken uint256
  */
  function addLocker(address from, uint256 duration, uint256 frozenToken) public onlyTimelockKeeper {
    ReleasePlanStruct.ReleasePlan storage releasePlan_ = releasePlanMap[from];
    if(!releasePlan_.initialized){
      releasePlan_.initialized = true;
    }
    releasePlan_.timeLockers.push(ReleasePlanStruct.TimeLocker(now + duration, frozenToken));
  }

  /**
  * @dev activate token transfers
  */
  function activate() public onlyOwner {
    active = true;
  }

  /**
  * @dev transfer  ERC20 standard transfer wrapped with onlyActiveOrOwner, allowedByTimeLocker
  */
  function transfer(address to, uint256 value) public onlyActiveOrOwner allowedByTimeLocker(msg.sender,value) returns (bool) {
    return super.transfer(to, value);
  }

  /**
  * @dev transfer  ERC20 standard transferFrom wrapped with onlyActiveOrOwner, allowedByTimeLocker
  */
  function transferFrom(address from, address to, uint256 value) public onlyActiveOrOwner allowedByTimeLocker(from, value) returns (bool) {
    return super.transferFrom(from, to, value);
  }
}
