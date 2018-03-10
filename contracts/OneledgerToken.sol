pragma solidity ^0.4.11;
import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract OneledgerToken is StandardToken {
  string public name = "Oneledger Token";
  string public symbol = "OLT";
  uint public decimals = 18;
  uint256 public INITIAL_SUPPLY = 100000000 * (10 ** decimals);

  function OneledgerToken() public {
      totalSupply_ = INITIAL_SUPPLY;
      balances[msg.sender] = INITIAL_SUPPLY;
  }
}
