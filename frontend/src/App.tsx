import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./contractABI.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskInput, setTaskInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");

  const loadTasks = async () => {
    if (!contract) return;
    
    try {
      setLoading(true);
      setError("");
      const myTasks = await contract.getMyTasks();
      console.log("Loaded tasks:", myTasks);
      setTasks(myTasks || []);
    } catch (error) {
      console.error("Error loading tasks:", error);
      setError("Failed to load tasks. Make sure the contract is deployed.");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      setError("MetaMask is not installed!");
      return;
    }

    try {
      setError("");
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      setProvider(provider);
      const signer = await provider.getSigner();
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      setIsConnected(true);
      
      const todoContract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      setContract(todoContract);
      
      // Load tasks after contract is set
      await loadTasks();
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setError("Failed to connect wallet. Please try again.");
    }
  };

  useEffect(() => {
    // Check if already connected
    if ((window as any).ethereum) {
      (window as any).ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            connectWallet();
          }
        })
        .catch(console.error);
    }
  }, []);

  const addTask = async () => {
    if (taskInput.trim() === "" || !contract) return;
    
    try {
      setLoading(true);
      setError("");
      const tx = await contract.addTask(taskInput);
      await tx.wait();
      await loadTasks();
      setTaskInput("");
    } catch (error) {
      console.error("Error adding task:", error);
      setError("Failed to add task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (id: number) => {
    if (!contract) return;
    
    try {
      setLoading(true);
      setError("");
      const tx = await contract.toggleComplete(id);
      await tx.wait();
      await loadTasks();
    } catch (error) {
      console.error("Error toggling task:", error);
      setError("Failed to update task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900  via-black to-blue-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 max-w-md w-full p-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-6">📝 Web3 To-Do</h1>
            <p className="text-gray-300 mb-8">Connect your wallet to start managing your tasks on the blockchain</p>
            <button
              onClick={connectWallet}
              className="bg-gradient-to-r from-blue-500 to-blue-900 text-white font-semibold py-3 px-6 rounded-lg transition-all ease-in-out duration-500 transform hover:scale-105 shadow-lg"
            >
              Connect Wallet
            </button>
            {error && (
              <p className="text-red-400 mt-4 text-sm">{error}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-blue-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📝 Web3 To-Do</h1>
          <p className="text-gray-300 text-sm">
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </p>
        </div>

        {/* Add Task Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-white/20 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter a new task..."
              className="flex-1 bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={addTask}
              disabled={loading || taskInput.trim() === ""}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Adding...
                </div>
              ) : (
                "Add Task"
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Tasks List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Your Tasks</h2>
          
          {loading && tasks.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
              <span className="text-gray-300">Loading tasks...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-300">No tasks yet. Add your first task to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors duration-200"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    disabled={loading}
                    className="w-5 h-5 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
                  />
                  <span
                    className={`flex-1 text-white ${
                      task.completed ? "line-through text-gray-400" : ""
                    }`}
                  >
                    {task.content}
                  </span>
                  <span className="text-xs text-gray-400">ID: {task.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
