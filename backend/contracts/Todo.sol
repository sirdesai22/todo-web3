// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Todo {
    struct Task {
        uint id;
        string content;
        bool completed;
    }

    uint public taskCount;
    mapping(address => Task[]) public tasksByUser;

    event TaskCreated(address indexed user, uint id, string content);
    event TaskToggled(address indexed user, uint id, bool completed);

    function addTask(string calldata _content) external {
        Task memory newTask = Task(taskCount, _content, false);
        tasksByUser[msg.sender].push(newTask);
        emit TaskCreated(msg.sender, taskCount, _content);
        taskCount++;
    }

    function toggleComplete(uint _id) external {
        Task[] storage userTasks = tasksByUser[msg.sender];
        require(_id < userTasks.length, "Invalid task ID");
        userTasks[_id].completed = !userTasks[_id].completed;
        emit TaskToggled(msg.sender, _id, userTasks[_id].completed);
    }

    function getMyTasks() external view returns (Task[] memory) {
        return tasksByUser[msg.sender];
    }
}