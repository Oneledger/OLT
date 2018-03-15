pragma solidity ^0.4.11;

library ReleasePlanStruct {
  struct TimeLocker {
    uint256 releaseTime;
    uint256 freezedTokens; //the token freezed before release time
  }
  struct ReleasePlan {
    uint8 flag;
    TimeLocker[] timeLockers;
  }
}
