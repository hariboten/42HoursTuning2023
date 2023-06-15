import { render, RenderOptions } from "@testing-library/react";
import React from "react";
import { IntlProvider } from "react-intl";
import { SWRConfig } from "swr";

const Providers: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        dedupingInterval: 0,
        provider: () => new Map(),
      }}
    >
      <IntlProvider locale="ja">{children}</IntlProvider>
    </SWRConfig>
  );
};

const customRender = (
  ui: React.ReactElement<any, string | React.JSXElementConstructor<any>>,
  options: RenderOptions = {}
) => render(ui, { wrapper: Providers, ...options });

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render };
