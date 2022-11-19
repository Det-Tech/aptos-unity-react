import { useEffect, useContext } from "react"
import { Route, Routes } from "react-router-dom"
import { ThemeContext, ThemeProvider } from "./context/ThemeContext"
import { Home } from "./pages/Home/Home"
import {
  WalletProvider,
  HippoWalletAdapter,
  AptosWalletAdapter,
  HippoExtensionWalletAdapter,
  MartianWalletAdapter,
  FewchaWalletAdapter,
  PontemWalletAdapter,
  SpikaWalletAdapter,
  RiseWalletAdapter,
  FletchWalletAdapter,
  TokenPocketWalletAdapter,
  ONTOWalletAdapter,
  BloctoWalletAdapter,
  SafePalWalletAdapter
} from '@manahippo/aptos-wallet-adapter';

import "./App.scss"
import 'react-notifications/lib/notifications.css';
import 'react-toastify/dist/ReactToastify.css';

const wallets = [
  new HippoWalletAdapter(),
  new MartianWalletAdapter(),
  new AptosWalletAdapter(),
  new FewchaWalletAdapter(),
  new HippoExtensionWalletAdapter(),
  new PontemWalletAdapter(),
  new SpikaWalletAdapter(),
  new RiseWalletAdapter(),
  new FletchWalletAdapter(),
  new TokenPocketWalletAdapter(),
  new ONTOWalletAdapter(),
  new BloctoWalletAdapter(),
  new SafePalWalletAdapter(),
];

function App() {
  const { dark } = useContext(ThemeContext)
  useEffect(() => {
    if (dark === "theme-dark") {
      document.documentElement.className = "theme-dark"
    } else document.documentElement.className = "theme-light"
  }, [dark])
  return (
    <>
        <ThemeProvider>
          <WalletProvider
              wallets={wallets}
              autoConnect={true} /** allow auto wallet connection or not **/
              onError={(error: Error) => {
                console.log('Handle Error Message', error);
              }}
          >
                <Routes>
                  <Route path="/" element={<Home />} />
                </Routes>
          </WalletProvider>
        </ThemeProvider>
    </>
  )
}

export default App
