pragma solidity 0.4.21;

library ReleasePlanStruct {
  struct TimeLocker {
    uint256 releaseTime;
    uint256 frozenTokens; //the token frozen before release time
  }
  struct ReleasePlan {
    uint8 flag;
    TimeLocker[] timeLockers;
  }
}
