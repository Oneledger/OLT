# Token Distribution requirement

## Concept

Token Name: OLT
Total Number: 100000000 * (10 ** decimal)
Distribution method:
- Team reserve: locked for 12 months with quarterly cliffs
- Advisor reserve: locked for 6 months with monthly release
- Company reserve: locked for 18 months with monthly release starting from the seventh month
- Others?

## Technical Requirement

Token contract:
  - The standard ERC 20 Token
  - Support TimeLock for transfer and transferFrom (different timelocks for different account)
  - After time lock ,the token can partially be transferred. The transferrable number will be increased quarterly or monthly

Pre-sales contract:
  - Presales contract will handle transfer the balance from token contract.
  - By transferring, the token will be set with time lock

Before ICO contract:
  - We deploy this contract the day before ICO
  - Buyer can send ETH to the contract and contract will send the one-day time locked token to the buyer
