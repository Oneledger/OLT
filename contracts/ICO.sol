pragma solidity 0.4.21;

import "./OneledgerToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract ICO is Ownable {
  using SafeMath for uint256;

  struct Registration {
    bool isInWhiteList;
    uint256 offeredWei;
    uint256 usedWei;
    uint256 lastUsed;
  }

  ERC20 public token;
  address public wallet; // Address where funds are collected
  uint256 public rate;   // How many token units a buyer gets per eth
  mapping(address => Registration) whiteList;
  uint256 initialTime;
  bool saleClosed;

  event PurchaseToken(uint256 weiAmount, uint256 rate, uint256 token, address beneficiary);

  modifier isNotClosed() {
    require(!saleClosed);
    _;
  }

  /**
  * @dev constructor
  */
  function ICO(address _wallet, ERC20 _token, uint256 _rate) public {
    require(_rate > 0);
    require(_wallet != address(0));
    require(_token != address(0));

    wallet = _wallet;
    token = _token;
    rate = _rate;
    initialTime = now;
    saleClosed = false;

    whiteList[address(0)] =  Registration(false, 0, 0, now); //A placeholder for buyer which is not in the whitelist
  }

  /**
  * @dev add to white list
  * param addresses the list of address added to white list
  * param weiPerContributor the wei can be transfer per contributor
  * param capWei for the user in this list
  */
  function addToWhiteList(address[] addresses, uint256 weiPerContributor) public onlyOwner {
    for (uint32 i = 0; i < addresses.length; i++) {
      whiteList[addresses[i]].isInWhiteList = true;
      whiteList[addresses[i]].offeredWei = weiPerContributor; //overriding even if the address exists
      whiteList[addresses[i]].usedWei = 0;
      whiteList[addresses[i]].lastUsed = now;
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
  function () external payable {
    buyTokens();
  }

  /**
   * @dev buy tokens
   */
  function buyTokens() public payable isNotClosed returns (bool) {
    uint256 timePassed = now - initialTime;
    Registration storage registration = findUserFromWhiteList(msg.sender);
    require(registration.isInWhiteList);

    if (timePassed > 48 hours) {
      // Free for all
      return freeForAll();
    } else if (timePassed > 24 hours ) {
      //Double offering stage
      return buyWithLimit(registration.offeredWei.mul(2), resetUsedWei(registration));
    } else {
      //Buy token per limit
      return buyWithLimit(registration.offeredWei, registration);
    }

  }

  function resetUsedWei(Registration registration) internal returns (Registration) {
    if(registration.lastUsed - initialTime <= 24 hours) {
      whiteList[msg.sender].usedWei = 0;
      return whiteList[msg.sender];
    } else {
      return registration;
    }
  }

  function freeForAll() internal returns (bool) {
    uint256 weiAmount = msg.value;
    require(weiAmount != 0);
    uint256 tokenToBuy = weiAmount.mul(rate);
    if (doPurchase(tokenToBuy)) {
      emit PurchaseToken(weiAmount, rate, tokenToBuy, msg.sender);
      return true;
    }
  }

  function buyWithLimit(uint256 limitation, Registration registration) internal returns (bool) {
    uint256 weiAmount = msg.value;
    require(weiAmount != 0 && weiAmount <= (limitation - registration.usedWei));
    uint256 tokenToBuy = weiAmount.mul(rate);
    if(doPurchase(tokenToBuy)){
      whiteList[msg.sender].usedWei += weiAmount;
      whiteList[msg.sender].lastUsed = now;
      emit PurchaseToken(weiAmount, rate, tokenToBuy, msg.sender);
      return true;
    }
  }

  function doPurchase(uint256 tokenToBuy) internal returns (bool) {
    token.transfer(msg.sender, tokenToBuy);
    wallet.transfer(msg.value);
    return true;
  }

  function findUserFromWhiteList(address user) internal view returns (Registration storage) {
    Registration storage registration = whiteList[user];
    if(registration.isInWhiteList == true) {
      return registration;
    }

    return whiteList[address(0)];
  }
}
