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

  OneledgerToken public token;
  address public wallet; // Address where funds are collected
  uint256 public rate;   // How many token units a buyer gets per eth
  mapping(address => WhiteListRecord) whiteList;
  uint256 initialTime;
  bool saleClosed;
  uint256 public weiCap;
  uint256 public weiRaised;

  event PurchaseToken(uint256 weiAmount, uint256 rate, uint256 token, address beneficiary);

  function validatePurchase(uint256 weiPaid) {
    require(!saleClosed);
    require(initialTime <= now);
    require(whiteList[msg.sender].isInWhiteList);
    require(weiPaid <= weiCap -  weiRaised);
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
  function ICO(address _wallet, uint256 _rate, uint256 _startDate, uint256 _weiCap) public {
    require(_rate > 0);
    require(_wallet != address(0));

    wallet = _wallet;
    token = new OneledgerToken();
    rate = _rate;
    initialTime = _startDate;
    saleClosed = false;
    weiCap = _weiCap;
    weiRaised = 0;
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
  function closeSale(address newOwner) public onlyOwner {
    saleClosed = true;
    uint256 balanceLeft = token.balanceOf(this);
    token.activate();
    if (balanceLeft > 0) {
        token.transfer(newOwner, balanceLeft);
    }
    token.transferOwnership(newOwner);
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
    validatePurchase(msg.value);
    uint256 tokenToBuy = msg.value.mul(rate);
    token.transfer(msg.sender, tokenToBuy);
    wallet.transfer(msg.value);
    whiteList[msg.sender].lastPurchasedTimestamp = now;
    weiRaised = weiRaised.add(msg.value);
  }
}
