import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Cert", (m) => {
  const counter = m.contract("CertiApp"); //contract name :CertiApp

  // m.call(counter, "incBy", [5n]);

  return { counter };
});
