// export const gasAmount = 4000000;

// Start block of the ICO
const startBlock = 0;
// End block of the ICO
const endBlock = 200000;
const satoshiPerEther = 12014999;
const tokensPerSatoshi = 2228;
const gasAmount = 4000000;
// Address of the owner of the ICO.
const owner = "0xaec3ae5d2be00bfc91597d7a1b2c43818d84396a";
const teamAddress = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const advisoryAddress = "0x0021960c030e065c3BD490AB9bcc31B93e1fb23c";
// Address of the teamAddress that will store the funds.
const escrowAddress = "0x00c539B1DCbAd08a652aCA4690c9F3e805D31808";
// Address of the first investor (with a lot of ether)
const firstInvestor = "0xf1f42f995046e67b79dd5ebafd224ce964740da3";
// Address of the new owner
const newOwner = "0xd646e8c228bfcc0ec6067ad909a34f14f45513b0";
// Number of tokens minted during ICO
const maxTokenSupply = 21000000 * Math.pow(10, 8);
// Tokens issued during ICO
const maxICOIssuance = 13650000 * Math.pow(10, 8);
// Number of tokens minted during the PreICO
const preICOsupply = 1050000 * Math.pow(10, 8);

module.exports = {
  startBlock: startBlock,
  endBlock: endBlock,
  satoshiPerEther: satoshiPerEther,
  tokensPerSatoshi: tokensPerSatoshi,
  gasAmount: gasAmount,
  owner: owner,
  teamAddress: teamAddress,
  advisoryAddress: advisoryAddress,
  escrowAddress: escrowAddress,
  newOwner: newOwner,
  firstInvestor: firstInvestor,
  maxTokenSupply: maxTokenSupply,
  maxICOIssuance: maxICOIssuance,
  preICOsupply: preICOsupply,
};
