pragma solidity ^0.4.11;

import "./ReleasePlanStruct.sol";
import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";


contract OneledgerToken is StandardToken {

  string public name = "Oneledger Token";
  string public symbol = "OLT";
  uint public decimals = 18;
  uint256 public INITIAL_SUPPLY = 100000000 * (10 ** decimals);
  address public owner;
  bool internal active_;
  mapping (address => ReleasePlanStruct.ReleasePlan) internal releasePlan;

  event DebugOutput(uint256 val);

  function requireAllowedByTimeLocker(address from, uint256 value) internal view  {
    ReleasePlanStruct.ReleasePlan storage rPlan = releasePlan[from];
    if(rPlan.flag == 1){
      uint256 allowedTokens = 0;
      ReleasePlanStruct.TimeLocker[] storage timeLockers = rPlan.timeLockers;
      for (uint i =0; i < timeLockers.length; i++){
        ReleasePlanStruct.TimeLocker storage locker = timeLockers[i];

        if(now > locker.releaseTime){
          allowedTokens += locker.allowedTokens;
        }
      }

      require(allowedTokens >= value + rPlan.totalTransferredTokens);
    }
  }

  function recordTransferredTokens(address from, uint256 value) internal {
    ReleasePlanStruct.ReleasePlan storage rPlan = releasePlan[from];
    if(rPlan.flag == 1){
      rPlan.totalTransferredTokens += value;
    }
  }

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }
  modifier onlyActivedOrOwner() {
    require(msg.sender == owner || active_ == true);//owner will by pass the active
    _;
  }

  modifier transferAllowedByTimeLocker(uint256 value) {
    if(msg.sender != owner){
      requireAllowedByTimeLocker(msg.sender, value);
    }
    _;
  }

  modifier transferFromAllowedByTimeLocker(address from, uint256 value) {
    requireAllowedByTimeLocker(from, value);
    _;
  }

  function addLocker(address from, uint256 duration, uint256 allowedToken) public{
    ReleasePlanStruct.ReleasePlan storage releasePlan_ = releasePlan[from];
    if(releasePlan_.flag != 1){
      releasePlan_.flag = 1;
      releasePlan_.totalTransferredTokens = 0;
    }
    releasePlan_.timeLockers.push(ReleasePlanStruct.TimeLocker(now + duration, allowedToken));
  }

  function OneledgerToken() public {
      totalSupply_ = INITIAL_SUPPLY;
      balances[msg.sender] = INITIAL_SUPPLY;
      owner = msg.sender;
      active_ = false;
  }
  function active() onlyOwner public {
    active_ = true;
  }

  function isActived() public constant returns (bool) {
    return active_;
  }

  function transfer(address to, uint256 value) public onlyActivedOrOwner transferAllowedByTimeLocker(value) returns (bool ret){
    ret =  super.transfer(to, value);
    if(ret){
      recordTransferredTokens(msg.sender, value);
    }
  }

  function transferFrom(address from, address to, uint256 value) public onlyActivedOrOwner transferFromAllowedByTimeLocker(from, value) returns (bool ret){
    ret = super.transferFrom(from, to, value);
    if(ret){
      recordTransferredTokens(from, value);
    }
  }
}
