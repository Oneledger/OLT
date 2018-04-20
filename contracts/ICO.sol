pragma solidity 0.4.21;

import "./OneledgerToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract ICO is Ownable {
  using SafeMath for uint256;

  struct WhiteListRecord {
    bool isInWhiteList;
    uint256 offeredWei;
    uint256 lastPurchasedTimestamp;
  }

  ERC20 public token;
  address public wallet; // Address where funds are collected
  uint256 public rate;   // How many token units a buyer gets per eth
  mapping(address => WhiteListRecord) whiteList;
  uint256 initialTime;
  bool saleClosed;

  event PurchaseToken(uint256 weiAmount, uint256 rate, uint256 token, address beneficiary);

  function validatePurchase() {
    require(!saleClosed);
    require(initialTime <= now);
    require(whiteList[msg.sender].isInWhiteList);
    // can only purchase once every 24 hours
    require(now.sub(whiteList[msg.sender].lastPurchasedTimestamp) > 24 hours);
    uint256 elapsedTime = now.sub(initialTime);
    // check day 1 buy limit
    require(elapsedTime > 24 hours || msg.value <= whiteList[msg.sender].offeredWei);
    // check day 2 buy limit
    require(elapsedTime > 48 hours || msg.value <= whiteList[msg.sender].offeredWei.mul(2));
  }

  /**
  * @dev constructor
  */
  function ICO(address _wallet, ERC20 _token, uint256 _rate, uint _startDate) public {
    require(_rate > 0);
    require(_wallet != address(0));
    require(_token != address(0));

    wallet = _wallet;
    token = _token;
    rate = _rate;
    initialTime = _startDate;
    saleClosed = false;
  }

  /**
  * @dev add to white list
  * param addresses the list of address added to white list
  * param weiPerContributor the wei can be transfer per contributor
  * param capWei for the user in this list
  */
  function addToWhiteList(address[] addresses, uint256 weiPerContributor) public onlyOwner {
    for (uint32 i = 0; i < addresses.length; i++) {
      whiteList[addresses[i]] = WhiteListRecord(true, weiPerContributor, 0);
    }
  }

  /**
   * @dev close the ICO
   */
  function closeSale() public onlyOwner {
    saleClosed = true;
  }

  /**
   * @dev fallback function ***DO NOT OVERRIDE***
   */
  function() external payable {
    buyTokens();
  }

  /**
   * @dev buy tokens
   */
  function buyTokens() public payable {
    validatePurchase();
    uint256 tokenToBuy = msg.value.mul(rate);
    token.transfer(msg.sender, tokenToBuy);
    wallet.transfer(msg.value);
    whiteList[msg.sender].lastPurchasedTimestamp = now;
  }
}
