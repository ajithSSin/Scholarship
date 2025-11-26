import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

export default buildModule("scholarship", (m) => {
  const counter = m.contract("scholarship");

  // m.call(counter, "incBy", [5n]);

  return { counter };
});
