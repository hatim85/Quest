import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { ethers } from 'ethers';
import Onboarding from './components/Onboarding';
import QuestDashboard from './components/QuestDashboard';
import GridVisualization from './components/GridVisualization';
import AddQuest from './components/AddQuest';
import Ethers from './utils/Ethers';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [networkError, setNetworkError] = useState('');
  const [provider, setProvider] = useState(null);
  const [profile, setProfile] = useState(null);
  const NETWORK_ID = '0x1069'; // CrossFi Testnet Chain ID
  const ADMIN_ADDRESS = '0xBba320Afb3690192d10eA9664c2CA9F85b40dc58';

  // Function to shorten the wallet address for display
  const shortenAddress = (address) => `${address.slice(0, 5)}...${address.slice(-4)}`;

  // Connect Wallet Functionality
  const connectWallet = async () => {
    if (!window.lukso) {
      toast.error('MetaMask or Lukso extension is not installed!');
      return;
    }

    try {
      const providerInstance = new ethers.providers.Web3Provider(window.lukso);
      await providerInstance.send('eth_requestAccounts', []);
      const signerInstance = providerInstance.getSigner();
      const address = await signerInstance.getAddress();

      const network = await providerInstance.getNetwork();
      if (network.chainId !== parseInt(NETWORK_ID, 16)) {
        setNetworkError('Please switch to the Lukso Testnet.');
      } else {
        setNetworkError('');
      }

      const result = await Ethers();
      if (result) {
        setContract(result.contract);
        setSigner(result.signer);
      }

      setWalletAddress(address);
      setProvider(providerInstance);
      setSigner(signerInstance);

      if (address.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
        navigate('/add-quest');
      } else {
        // navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  // Check network on provider change
  useEffect(() => {
    const checkNetwork = async () => {
      if (provider) {
        try {
          const network = await provider.getNetwork();
          if (network.chainId !== parseInt(NETWORK_ID, 16)) {
            setNetworkError('Please switch to the Lukso Testnet.');
          } else {
            setNetworkError('');
          }
        } catch (error) {
          console.error('Error checking network:', error);
          toast.error('Error checking network');
        }
      }
    };

    checkNetwork();
  }, [provider]);

  // Handle account and network changes
  useEffect(() => {
    if (window.lukso && provider) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          setWalletAddress('');
          setContract(null);
          setSigner(null);
          setProvider(null);
          navigate('/');
        } else {
          const newAddress = accounts[0];
          setWalletAddress(newAddress);
          const newSigner = provider.getSigner();
          setSigner(newSigner);
          const result = await Ethers();
          if (result) {
            setContract(result.contract);
            setSigner(result.signer);
          }
          if (newAddress.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
            navigate('/add-quest');
          }
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.lukso.on('accountsChanged', handleAccountsChanged);
      window.lukso.on('chainChanged', handleChainChanged);

      return () => {
        window.lukso.removeListener('accountsChanged', handleAccountsChanged);
        window.lukso.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [provider, navigate]);

  const switchNetwork = async () => {
    if (!window.lukso) {
      toast.error('MetaMask or Lukso extension is not installed!');
      return;
    }

    try {
      await window.lukso.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK_ID }],
      });
      setNetworkError('');
    } catch (switchError) {
      if (switchError.code === 4902) {
        await addNetwork();
      } else {
        console.error('Error switching network:', switchError);
        toast.error('Error switching network');
      }
    }
  };

  const addNetwork = async () => {
    try {
      await window.lukso.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: NETWORK_ID,
            chainName: 'Lukso Testnet',
            rpcUrls: ['https://rpc.testnet.lukso.network'],
            nativeCurrency: {
              name: 'Lukso',
              symbol: 'LYXt',
              decimals: 18,
            },
            blockExplorerUrls: ['https://explorer.execution.testnet.lukso.network'],
          },
        ],
      });
    } catch (addError) {
      console.error('Error adding network:', addError);
      toast.error('Error adding network');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 text-gray-900 font-sans">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">
            <Link to="/">GridQuest</Link>
          </h1>
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2"
            aria-label="Connect Wallet"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5.121 18.879A3 3 0 018 17h8a3 3 0 012.879 1.879M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {walletAddress ? shortenAddress(walletAddress) : 'Connect Wallet'}
          </button>
        </div>
      </header>

      {networkError && (
        <div className="fixed top-20 left-0 right-0 mx-auto max-w-md bg-red-500 text-white rounded-lg shadow-lg p-4 flex items-center justify-between z-50">
          <span>{networkError}</span>
          <button
            onClick={switchNetwork}
            className="px-3 py-1 bg-white text-red-500 rounded-md hover:bg-gray-100 transition-colors duration-200"
          >
            Switch Network
          </button>
        </div>
      )}

      <main className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center">
        <Routes>
          <Route
            path="/"
            element={
              <Onboarding
                contract={contract}
                signer={signer}
                setProfile={setProfile}
                walletAddress={walletAddress}
                connectWallet={connectWallet}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <QuestDashboard
                contract={contract}
                signer={signer}
                profile={profile}
                setProfile={setProfile}
              />
            }
          />
          <Route
            path="/grid"
            element={<GridVisualization contract={contract} signer={signer} />}
          />
          <Route
            path="/add-quest"
            element={<AddQuest contract={contract} signer={signer} />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;