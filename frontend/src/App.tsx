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

  const loadTasks = async () => {
    if (!contract) return;
    
    try {
      setLoading(true);
      const myTasks = await contract.getMyTasks();
      setTasks(myTasks || []);
    } catch (error) {
      console.error("Error loading tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      if ((window as any).ethereum) {
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          setProvider(provider);
          const signer = await provider.getSigner();
          const accounts = await provider.send("eth_requestAccounts", []);
          setAccount(accounts[0]);
          const todoContract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
          setContract(todoContract);
          
          // Load tasks after contract is set
          await loadTasks();
        } catch (error) {
          console.error("Error initializing:", error);
        }
      }
    }
    init();
  }, []);

  const addTask = async () => {
    if (taskInput.trim() === "" || !contract) return;
    
    try {
      setLoading(true);
      const tx = await contract.addTask(taskInput);
      await tx.wait();
      await loadTasks();
      setTaskInput("");
    } catch (error) {
      console.error("Error adding task:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (id: number) => {
    if (!contract) return;
    
    try {
      setLoading(true);
      const tx = await contract.toggleComplete(id);
      await tx.wait();
      await loadTasks();
    } catch (error) {
      console.error("Error toggling task:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, color: "white", backgroundColor: "black", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", width: "100%", gap: "20px" }}>
      <h1>📝 Web3 To-Do</h1>
      <p>Connected: {account}</p>

      <input
        type="text"
        value={taskInput}
        onChange={(e) => setTaskInput(e.target.value)}
        placeholder="Enter task..."
        style={{ padding: 10, borderRadius: 5, border: "1px solid white", backgroundColor: "transparent", color: "white" }}
        disabled={loading}
      />
      <button 
        onClick={addTask} 
        style={{ 
          padding: 10, 
          borderRadius: 5, 
          border: "1px solid white", 
          backgroundColor: loading ? "gray" : "blue", 
          color: "white", 
          cursor: loading ? "not-allowed" : "pointer" 
        }}
        disabled={loading}
      >
        {loading ? "Loading..." : "Add Task"}
      </button>

      {loading && <p>Loading tasks...</p>}
      
      <ul>
        {tasks.length === 0 && !loading ? (
          <li>No tasks yet. Add your first task!</li>
        ) : (
          tasks.map((task, i) => (
            <li key={i}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                disabled={loading}
              />
              <span style={{ textDecoration: task.completed ? "line-through" : "none" }}>
                {task.content}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default App;
