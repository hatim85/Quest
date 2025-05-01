import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
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
  const [profile, setProfile] = useState(null);
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [networkError, setNetworkError] = useState('');
  const [provider, setProvider] = useState(null);
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
      // Request wallet connection
      const providerInstance = new ethers.providers.Web3Provider(window.lukso);
      await providerInstance.send('eth_requestAccounts', []);
      const signerInstance = providerInstance.getSigner();
      const address = await signerInstance.getAddress();

      // Check network
      const network = await providerInstance.getNetwork();
      if (network.chainId !== parseInt(NETWORK_ID, 16)) {
        setNetworkError('Please switch to the Lukso Testnet.');
      } else {
        setNetworkError('');
      }

      // Load contract
      const result = await Ethers();
      if (result) {
        setContract(result.contract);
        setSigner(result.signer);
      }

      // Set wallet address and provider
      setWalletAddress(address);
      setProvider(providerInstance);
      setSigner(signerInstance);

      // Navigate admin to add-quest page
      if (address.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
        navigate('/add-quest');
      } else {
        navigate('/dashboard');
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
          // Wallet disconnected
          setWalletAddress('');
          setContract(null);
          setSigner(null);
          setProvider(null);
          setProfile(null);
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
          // Navigate admin to add-quest
          if (newAddress.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
            navigate('/add-quest');
          }
        }
      };

      const handleChainChanged = () => {
        window.location.reload(); // Reload to clear state and recheck network
      };

      window.lukso.on('accountsChanged', handleAccountsChanged);
      window.lukso.on('chainChanged', handleChainChanged);

      return () => {
        window.lukso.removeListener('accountsChanged', handleAccountsChanged);
        window.lukso.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [provider, navigate]);

  // Switch to Lukso Testnet
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

  // Add Lukso Testnet to wallet
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
    <div className="min-h-screen bg-gray-100 text-black">
      <ToastContainer position="top-right" autoClose={5000} />
      <button
        onClick={connectWallet}
        className="wallet-btn bg-blue-600 absolute top-0 right-0 m-5 p-3 text-white rounded-md hover:bg-blue-700"
      >
        {walletAddress ? shortenAddress(walletAddress) : 'Connect Wallet'}
      </button>

      {networkError && (
        <div className="m-5 p-5 absolute bg-red-500 text-white rounded-md">
          {networkError}
          <button
            onClick={switchNetwork}
            className="ml-4 p-2 outline-none rounded-md bg-blue-500 hover:bg-blue-600"
          >
            Switch Network
          </button>
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={
            <Onboarding
              contract={contract}
              signer={signer}
              setProfile={setProfile}
              walletAddress={walletAddress}
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
    </div>
  );
}

export default App;