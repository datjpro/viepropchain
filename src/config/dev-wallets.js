// src/config/dev-wallets.js
// DEV ONLY: danh sách ví Ganache để test auto-signing
// TUYỆT ĐỐI KHÔNG PUSH PRIVATE KEYS LÊN REPO PUBLIC

// DEV ONLY: danh sách ví Ganache (address + privateKey)
// TUYỆT ĐỐI KHÔNG PUSH LÊN REMOTE PUBLIC
export const DEV_WALLETS = [
  {
    name: "Account Admin",
    address: "0xC6890b26A32d9d92aefbc8635C4588247529CdfE",
    privateKey:
      "0x843501ecc602247126b5c52ff65d3b0050a9039f23480f005535465ac2734fae",
  },
  {
    name: "Account user 1",
    address: "0xd1ABb2a4Bb9652f90E0944AFfDf53F0cFFf54D13",
    privateKey:
      "0x1144978e74c50b416d71a9b32ebeac44e2954bdcf53ea12dd61b993af2dc29f4",
  },
  {
    name: "Account 2",
    address: "0xDE4936c84576B5552E31290FEaeE715bF32ca231",
    privateKey:
      "0x86e083b54618c1f3ae760b05088bd9a0008b9b131b6620f79db0d3192a0aeffd",
  },
  {
    name: "Account 3",
    address: "0xaFbf4209c851746a7E9E64C5aEadF0f40C187554",
    privateKey:
      "0x9cc5ae89ca6ecc6ed45d3381c797f776f7c58f2630819e84243f25bbb7955f09",
  },
  {
    name: "Account 4",
    address: "0xE4a811c220372C705E00F342988A6Fd5C77B06f8",
    privateKey:
      "0x597c8304a815d8ed2d205e3cbe7414fb9479abb41a1ef61cf841ce0dc3f39774",
  },
  {
    name: "Account 5",
    address: "0x28125abEcB7b1E1aF3DdE4f7397911F934e5a5B9",
    privateKey:
      "0x00e2d203b35ea4707782945850e8227f609af98cc0fa17f0a7ccf9ec9c678ac7",
  },
  {
    name: "Account 6",
    address: "0x8a941a249D4Fc3ADC87CDB86d154a79bAf36578A",
    privateKey:
      "0x01adb10db362c932badeb1d888c1770b4d0e2e81bb8440847ee2a3a15cce4bc0",
  },
  {
    name: "Account 7",
    address: "0xea98c30D52AdFc043F2846B20E79e1C05e267603",
    privateKey:
      "0x7187d6b0044e92ce53d03ad66149707522fb9075ce8bea77a43cf9517df4c58d",
  },
  {
    name: "Account 8",
    address: "0x1c50C1b4D7Bc6A08166e592526c591B5c5FD79b5",
    privateKey:
      "0xe23a8b14f4da266401cac5944d9e58f16d9841b1b52a397d786f58a17126a282",
  },
  {
    name: "Account 9",
    address: "0x8af870CEFF1F8d48f28cF936d65b29CDE326D229",
    privateKey:
      "0xc6a67496ab3225ebfbc2d3eff5683c493f0943c4018d67acf34a81e591bdee0b",
  },
];

// HD Wallet / Mnemonic (Ganache)
export const DEV_MNEMONIC =
  "arm either chef prosper fish lonely rigid antique dawn stumble wife camera";

// Default RPC for dev (Ganache) — adjust if needed
export const DEV_PROVIDER = "http://127.0.0.1:7545";
