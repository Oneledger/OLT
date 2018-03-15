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


  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }
  modifier onlyActivedOrOwner() {
    require(msg.sender == owner || active_ == true);//owner will by pass the active
    _;
  }
  function OneledgerToken() public {
      totalSupply_ = INITIAL_SUPPLY;
      balances[msg.sender] = INITIAL_SUPPLY;
      owner = msg.sender;
      active_ = false;
  }

  function addLocker(address from, uint256 duration, uint256 freezedToken) public onlyOwner{
    ReleasePlanStruct.ReleasePlan storage releasePlan_ = releasePlan[from];
    if(releasePlan_.flag != 1){
      releasePlan_.flag = 1;
    }
    releasePlan_.timeLockers.push(ReleasePlanStruct.TimeLocker(now + duration, freezedToken));
  }

  function active()  public onlyOwner{
    active_ = true;
  }

  function isActived() public constant returns (bool) {
    return active_;
  }

  function transfer(address to, uint256 value) public onlyActivedOrOwner allowedByTimeLocker(msg.sender,value) returns (bool){
    return super.transfer(to, value);
  }
  function transferFrom(address from, address to, uint256 value) public onlyActivedOrOwner allowedByTimeLocker(from, value) returns (bool){
    return super.transferFrom(from, to, value);
  }
}
