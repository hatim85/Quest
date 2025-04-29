import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Onboarding from './components/Onboarding';
import QuestDashboard from './components/QuestDashboard';
import GridVisualization from './components/GridVisualization';
import Ethers from './utils/Ethers';
import { ToastContainer, toast } from 'react-toastify';
import { ethers } from 'ethers';
import AddQuest from './components/AddQuest';
import YouTubePlayer from './components/YouTubePlayer';

function App() {
  const [profile, setProfile] = useState(null);
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [networkError, setNetworkError] = useState('');
  const [provider, setProvider] = useState(null);
  const NETWORK_ID = '0x1069'; // CrossFi Testnet Chain ID
  const navigate = useNavigate();

  // Function to shorten the wallet address for display
  const shortenAddress = (address) =>
    `${address.slice(0, 5)}...${address.slice(-4)}`;

  // Connect Wallet Functionality
  const connectWallet = async () => {
    if (!window.lukso) {
      toast.error('MetaMask or Lukso extension is not installed!');
      return;
    }

    try {
      // Request wallet connection
      await window.lukso.request({ method: 'eth_requestAccounts' });
      const providerInstance = new ethers.providers.Web3Provider(window.lukso);
      const signerInstance = providerInstance.getSigner();
      const address = await signerInstance.getAddress();

      setWalletAddress(address);
      setProvider(providerInstance);
      setSigner(signerInstance);

      // Check network
      const network = await providerInstance.getNetwork();
      if (network.chainId !== parseInt(NETWORK_ID, 16)) {
        setNetworkError('Please switch to the Lukso testnet.');
      } else {
        setNetworkError('');
      }

      // Load contract
      const result = await Ethers();
      if (result) {
        setContract(result.contract);
        setSigner(result.signer);
      }

      // Admin check for navigation
      if (address.toLowerCase() === '0x39987ca04006c3d9d895985e435a97489905eb75') {
        navigate('/add-quest', { replace: true });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  // Check if the user is on the correct network
  const checkNetwork = async (providerInstance) => {
    if (!window.lukso || !providerInstance) return;

    try {
      const network = await providerInstance.getNetwork();
      if (network.chainId !== parseInt(NETWORK_ID, 16)) {
        setNetworkError('Please switch to the Lukso testnet.');
      } else {
        setNetworkError('');
      }
    } catch (error) {
      console.error('Error checking network:', error);
      toast.error('Error checking network');
    }
  };

  // Switch the user to the correct network
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
        addNetwork();
      } else {
        console.error('Error switching network:', switchError);
        toast.error('Error switching network');
      }
    }
  };

  // Add the network if it's not already configured
  const addNetwork = async () => {
    if (!window.lukso) {
      toast.error('MetaMask or Lukso extension is not installed!');
      return;
    }

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
    <>
      <ToastContainer />
      <button
        onClick={connectWallet}
        className="wallet-btn bg-blue-600 top-0 absolute right-0 m-5 p-3 text-center rounded-md"
      >
        {!walletAddress ? 'Connect Wallet' : shortenAddress(walletAddress)}
      </button>

      {/* Network Error Display */}
      {networkError && (
        <div className="w-auto m-5 p-5 absolute bg-red-500 text-white rounded-md">
          {networkError}
          <button
            onClick={switchNetwork}
            className="ml-4 p-2 outline-none rounded-md bg-blue-500"
          >
            Switch Network
          </button>
        </div>
      )}

      <div className="min-h-screen bg-gray-100 text-black">
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
            element={<GridVisualization profile={profile} />}
          />
          <Route
            path="/add-quest"
            element={<AddQuest contract={contract} signer={signer} />}
          />
        </Routes>
      </div>
    </>
  );
}

export default App;


// import { useState, useEffect } from 'react';
// import { ERC725 } from '@erc725/erc725.js';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import initializeEthers from './Ethers';
// import QuestDashboard from './QuestDashboard';
// import schemas from '@erc725/erc725.js/build/main/src/lib/schemas';

// const App = () => {
//   const [provider, setProvider] = useState(null);
//   const [signer, setSigner] = useState(null);
//   const [contract, setContract] = useState(null);
//   const [userAddress, setUserAddress] = useState('');
//   const [profile, setProfile] = useState(null);
//   const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

//   const setupWallet = async () => {
//     const result = await initializeEthers();
//     if (result.error) {
//       toast.error(result.error === 'No wallet detected' 
//         ? 'Please install MetaMask or Universal Profile Browser Extension.' 
//         : 'Failed to connect wallet. Ensure LUKSO Testnet is selected.');
//       return;
//     }

//     const { provider, signer, contract } = result;
//     try {
//       const address = await signer.getAddress();
//       setProvider(provider);
//       setSigner(signer);
//       setContract(contract);
//       setUserAddress(address);
//       setIsCorrectNetwork(true);

//       // Fetch Universal Profile data
//       await fetchProfile(address, contract);
//     } catch (error) {
//       console.error('Wallet setup failed:', error);
//       toast.error('Failed to connect wallet.');
//     }
//   };

//   const fetchProfile = async (address, contract) => {
//     try {
//       const erc725 = new ERC725(
//         schemas, // Includes LSP3Profile
//         address,
//         'https://rpc.lukso-testnet.network',
//         { ipfsGateway: 'https://2eff.lukso.dev/ipfs/' }
//       );
//       const profileData = await erc725.fetchData('LSP3Profile');
//       const profileValue = profileData.value?.LSP3Profile || {};

//       // Fetch GridQuest-specific data
//       const storedProfile = JSON.parse(localStorage.getItem(address) || '{}');
//       const xp = await contract.getXP(address);
//       const level = await contract.getLevel(address);

//       setProfile({
//         name: profileValue.name || 'Anonymous',
//         description: profileValue.description || '',
//         links: profileValue.links || [],
//         profileImage: profileValue.profileImage?.[0]?.url || '',
//         xp: Number(xp) || storedProfile.xp || 0,
//         level: Number(level) || storedProfile.level || 0,
//         completedQuests: storedProfile.completedQuests || [],
//       });
//     } catch (error) {
//       console.error('Failed to fetch UP data:', error);
//       setProfile({
//         name: 'Anonymous',
//         description: '',
//         links: [],
//         profileImage: '',
//         xp: 0,
//         level: 0,
//         completedQuests: [],
//       });
//     }
//   };

//   useEffect(() => {
//     setupWallet();
//     if (window.ethereum) {
//       window.ethereum.on('accountsChanged', (accounts) => {
//         if (accounts.length > 0) {
//           setUserAddress(accounts[0]);
//           fetchProfile(accounts[0], contract);
//         } else {
//           setUserAddress('');
//           setProfile(null);
//           setSigner(null);
//           setContract(null);
//           setProvider(null);
//         }
//       });
//       window.ethereum.on('chainChanged', () => {
//         window.location.reload();
//       });
//     }
//     return () => {
//       if (window.ethereum) {
//         window.ethereum.removeAllListeners('accountsChanged');
//         window.ethereum.removeAllListeners('chainChanged');
//       }
//     };
//   }, [contract]);

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-4">GridQuest</h1>
//       {userAddress && isCorrectNetwork ? (
//         <QuestDashboard
//           provider={provider}
//           signer={signer}
//           contract={contract}
//           userAddress={userAddress}
//           profile={profile}
//           setProfile={setProfile}
//           isCorrectNetwork={isCorrectNetwork}
//         />
//       ) : (
//         <div className="flex items-center justify-center min-h-screen">
//           <button
//             onClick={setupWallet}
//             className="p-2 bg-blue-500 text-white rounded"
//           >
//             Connect with Universal Profile
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;