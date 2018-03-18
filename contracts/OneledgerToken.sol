pragma solidity ^0.4.11;

import "./ReleasePlanStruct.sol";
import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

/**
* @title OneledgerToken
* @dev this is the oneledger token
*/
contract OneledgerToken is StandardToken {

  string public name = "Oneledger Token";
  string public symbol = "OLT";
  uint public decimals = 18;
  uint256 public INITIAL_SUPPLY = 100000000 * (10 ** decimals);
  address public owner;
  address public timelockKeeper;
  bool internal active_;
  mapping (address => ReleasePlanStruct.ReleasePlan) internal releasePlan;

  /**
  * @dev control the token transfer to be controlled by time locker
  * @param from address the target address
  * @param value the total value needs to be allowed
  */
  modifier allowedByTimeLocker(address from, uint256 value)  {
    ReleasePlanStruct.ReleasePlan storage rPlan = releasePlan[from];
    if(rPlan.flag == 1){
      uint256 freezedTokens = 0;
      ReleasePlanStruct.TimeLocker[] storage timeLockers = rPlan.timeLockers;
      for (uint i =0; i < timeLockers.length; i++){
        ReleasePlanStruct.TimeLocker storage locker = timeLockers[i];
        if(locker.releaseTime >= now){
          freezedTokens += locker.freezedTokens;
        }
      }
      require( balances[from] >= value + freezedTokens);
    }
    _;
  }

  /**
  * @dev control the behavior can only be done by owner
  */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  /**
  * @dev control the behavior can only be done by timelockKeeper
  */
  modifier onlyTimelockKeeper() {
    require(msg.sender == timelockKeeper);
    _;
  }

  /**
  * @dev control the action can only be done by actived token and owner can by pass all of this
  */
  modifier onlyActivedOrOwner() {
    require(msg.sender == owner || active_ == true);//owner will by pass the active
    _;
  }

  /**
  * @dev constructor
  */
  function OneledgerToken() public {
      totalSupply_ = INITIAL_SUPPLY;
      balances[msg.sender] = INITIAL_SUPPLY;
      owner = msg.sender;
      active_ = false;
  }

  /**
  * @dev set the time lock keeper
  * @param keeper address the keeper's contract address
  */
  function setTimelockKeeper(address keeper) public onlyOwner {
    timelockKeeper =  keeper;
  }

  /**
  * @dev addLocker add the time lock for the user
  * @param from address
  * @param duration uint256
  * @param freezedToken uint256
  */
  function addLocker(address from, uint256 duration, uint256 freezedToken) public onlyTimelockKeeper{
    ReleasePlanStruct.ReleasePlan storage releasePlan_ = releasePlan[from];
    if(releasePlan_.flag != 1){
      releasePlan_.flag = 1;
    }
    releasePlan_.timeLockers.push(ReleasePlanStruct.TimeLocker(now + duration, freezedToken));
  }

  /**
  * @dev active to active the token, once it is activated, it cannot be reverted
  */
  function active()  public onlyOwner{
    active_ = true;
  }
  /**
  * @dev isActived query if this token contract is activated
  */
  function isActived() public constant returns (bool) {
    return active_;
  }
  /**
  * @dev transfer  ERC20 standard transfer wrapped with onlyActivedOrOwner, allowedByTimeLocker
  */
  function transfer(address to, uint256 value) public onlyActivedOrOwner allowedByTimeLocker(msg.sender,value) returns (bool){
    return super.transfer(to, value);
  }

  /**
  * @dev transfer  ERC20 standard transferFrom wrapped with onlyActivedOrOwner, allowedByTimeLocker
  */
  function transferFrom(address from, address to, uint256 value) public onlyActivedOrOwner allowedByTimeLocker(from, value) returns (bool){
    return super.transferFrom(from, to, value);
  }
}
