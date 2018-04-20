# Token Distribution requirement

## Process

- Deploy the ICO contract: Token contract will be created at the same time ICO contract deployed and enough amount will be transferred to ICO contract. The token is not activated yet and can only be distributed by the owner
- Token vesting contract will be generated per user(token vesting beneficiary)
- ICO contract is the owner of the token, hence it can transfer the token to the user(early investor) and vesting contractor
- after ICO and before going to listing in exhcanges. we can call ICO.endSales(). The ICO will be ended and the ownership of the token will be transferred; the token will be activated and the vesting contract will be able to send the token to the vesting beneficiary
