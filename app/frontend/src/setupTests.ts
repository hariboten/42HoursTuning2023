import "@testing-library/jest-dom";
jest.setTimeout(20000);

// jest.mock("next/router", () => {
//   const module = jest.requireActual("next/router");
//   return {
//     __esModule: true,
//     ...module,
//     useRouter: () => ({
//       push: () => {},
//     }),
//   };
// });
