pragma solidity ^0.4.11;

import "./OneledgerToken.sol";
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";

contract ICO {
  using SafeMath for uint256;

  ERC20 public token;

  // Address where funds are collected
  address public wallet;

  // How many token units a buyer gets per eth
  uint256 public rate;

  event PurchaseToken(uint256 weiAmount, uint256 rate, uint256 token, address beneficiary);

  function ICO(address _wallet, ERC20 _token, uint256 _rate) public {
    require(_rate > 0);
    require(_wallet != address(0));
    require(_token != address(0));

    wallet = _wallet;
    token = _token;
    rate = _rate;
  }
  /**
   * @dev fallback function ***DO NOT OVERRIDE***
   */
  function () external payable {
    buyTokens(msg.sender);
  }

  function buyTokens(address _beneficiary) public payable returns (bool){
    uint256 weiAmount = msg.value;
    require(_beneficiary != 0);
    require(weiAmount != 0);
    uint256 tokenToBuy = weiAmount.mul(rate);
    token.transfer(_beneficiary, tokenToBuy);
    wallet.transfer(msg.value);
    PurchaseToken(weiAmount, rate, tokenToBuy, _beneficiary);
    return true;
  }
}
