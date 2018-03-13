pragma solidity ^0.4.11;
import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract OneledgerToken is StandardToken {
  string public name = "Oneledger Token";
  string public symbol = "OLT";
  uint public decimals = 18;
  uint256 public INITIAL_SUPPLY = 100000000 * (10 ** decimals);
  address public owner;
  bool active_;

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
  function active() onlyOwner public {
    active_ = true;
  }

  function isActived() public constant returns (bool) {
    return active_;
  }

  function transfer(address to, uint256 value) public onlyActivedOrOwner returns (bool){
    return super.transfer(to, value);
  }

  function transferFrom(address from, address to, uint256 value) public onlyActivedOrOwner returns (bool){
    return super.transferFrom(from, to, value);
  }
}
