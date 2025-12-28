import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Network:", network.name);
  console.log("Deployer:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance (wei):", balance.toString());

  const CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");

  // Deploy with admin = deployer
  const registry = await CertificateRegistry.deploy(deployer.address);
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  console.log("CertificateRegistry deployed to:", contractAddress);

  // Grant ISSUER_ROLE to deployer for immediate mint/revoke in demo
  const tx = await registry.addIssuer(deployer.address);
  console.log("Granting ISSUER_ROLE tx:", tx.hash);
  await tx.wait();

  console.log("Issuer role granted to deployer:", deployer.address);

  // Quick sanity: read role constant (optional)
  // const issuerRole = await registry.ISSUER_ROLE();
  // console.log("ISSUER_ROLE:", issuerRole);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
