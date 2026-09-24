import Head from "next/head";
import "../styles/globals.css";
import { StoreProvider } from "../lib/store";
import Layout from "../components/Layout";

export default function App({ Component, pageProps }) {
  return (
    <StoreProvider>
      <Head>
        <title>Vasky | Step Into Your Style</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Vasky — sneakers, classics and kids' favorites. Cash on delivery across Lebanon." />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </StoreProvider>
  );
}
