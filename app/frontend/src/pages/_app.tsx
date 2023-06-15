import "@src/styles/globals.css";
import type { AppProps } from "next/app";
import { IntlProvider } from "react-intl";
import { SWRConfig } from "swr";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
      }}
    >
      <IntlProvider locale="ja">
        <Component {...pageProps} />
      </IntlProvider>
    </SWRConfig>
  );
};

export default MyApp;
