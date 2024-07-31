const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  name: { type: String, required: false },
  email: { type: String, required: false, unique: true },
  createdAt: { type: Date},
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
});

const taskSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true},
  task: { type: String, required: false },
  taskDetails: { type: String, required: false },
  category: { type: String, required: false },
  due: { type: Date, required: false },
  duration: { type: String, required: false },
  delegate: { type: Boolean, default: false },
  important: { type: Boolean, default: false },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date},
  updatedAt: { type: Date}
});

const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);

module.exports = { User, Task };
