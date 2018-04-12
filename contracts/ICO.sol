pragma solidity 0.4.21;

import "./OneledgerToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract ICO is Ownable {
  using SafeMath for uint256;

  struct Registration {
    uint8 tierIndex;
    bool isInWhiteList;
    uint256 offeredWei;
    uint256 usedWei;
    uint256 lastUsed;
  }

  ERC20 public token;
  address public wallet; // Address where funds are collected
  uint256 public rate;   // How many token units a buyer gets per eth
  mapping(uint8 => mapping (address => Registration)) tiers;
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

    tiers[0][address(0)] =  Registration(0, false, 0, 0, now);
  }

  /**
  * @dev add to white list
  * param tierIndex 0,1,2,3 to indicate the tier tierIndex
  * param addresses the list of address added to white list
  * param weiPerContributor the wei can be transfer per contributor
  * param capWeiPerTier
  */
  function whiteList(uint8 tierIndex, address[] addresses, uint256 weiPerContributor) public onlyOwner {
    require(tierIndex >= 0 && tierIndex < 4);
    for (uint32 i = 0; i < addresses.length; i++) {
      tiers[tierIndex][addresses[i]].isInWhiteList = true;
      tiers[tierIndex][addresses[i]].offeredWei = weiPerContributor; //overriding even if the address exists
      tiers[tierIndex][addresses[i]].usedWei = 0;
      tiers[tierIndex][addresses[i]].tierIndex = tierIndex;
      tiers[tierIndex][addresses[i]].lastUsed = now;
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
      tiers[registration.tierIndex][msg.sender].usedWei = 0;
      return tiers[registration.tierIndex][msg.sender];
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
      tiers[registration.tierIndex][msg.sender].usedWei += weiAmount;
      tiers[registration.tierIndex][msg.sender].lastUsed = now;
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
    for(uint8 i = 0; i < 4; i++) {
      Registration storage registration = tiers[i][user];
      if(registration.isInWhiteList == true) {
        return registration;
      }
    }

    return tiers[0][address(0)];
  }
}
