pragma solidity 0.4.21;
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
  bool public active;

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
  * @dev activate token transfers
  */
  function activate() public onlyOwner {
    active = true;
  }

  /**
  * @dev transfer  ERC20 standard transfer wrapped with onlyActiveOrOwner
  */
  function transfer(address to, uint256 value) public onlyActiveOrOwner  returns (bool) {
    return super.transfer(to, value);
  }

  /**
  * @dev transfer  ERC20 standard transferFrom wrapped with onlyActiveOrOwner
  */
  function transferFrom(address from, address to, uint256 value) public onlyActiveOrOwner returns (bool) {
    return super.transferFrom(from, to, value);
  }
}
