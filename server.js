const express = require('express');
const Parse = require('parse/node');
const cors = require('cors');

// Configuração do Parse (Back4App)
Parse.initialize(
  "2qtLfIApDFP8UY7WSTJm5zdo7pXELnVEchvIh9MD", // Application ID
  "h7ALdXSQrRZzsDHOVqnKvRALMijNtPmNf3fwjs17", // JavaScript Key (opcional)
  "8ooYu0Fvf1GTe1w6B2uRC3GPyc7nLJn1tNazZ8If"      // Master Key
);
Parse.serverURL = 'https://parseapi.back4app.com/';

const app = express();
app.use(express.json());
app.use(cors());

// Rotas CRUD para a To-Do List
// ... (as rotas serão definidas abaixo)
//Post Route
app.post('/todos', async (req, res) => {
  const { title, description, isCompleted } = req.body;
  
  const Todo = Parse.Object.extend('Todo');
  const todo = new Todo();
  
  todo.set('title', title);
  todo.set('description', description || '');
  todo.set('isCompleted', isCompleted || false);

  try {
    const savedTodo = await todo.save();
    res.status(201).json(savedTodo.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//Get Route
app.get('/todos', async (req, res) => {
  const query = new Parse.Query('Todo');
  try {
    const results = await query.find();
    const todos = results.map(todo => todo.toJSON());
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Update Route
app.put('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, isCompleted } = req.body;

  const query = new Parse.Query('Todo');
  try {
    const todo = await query.get(id);
    if (title) todo.set('title', title);
    if (description) todo.set('description', description);
    if (isCompleted !== undefined) todo.set('isCompleted', isCompleted);
    
    const updatedTodo = await todo.save();
    res.json(updatedTodo.toJSON());
  } catch (error) {
    res.status(404).json({ error: 'Todo não encontrada' });
  }
});

//Delete Route
app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const query = new Parse.Query('Todo');
  
  try {
    const todo = await query.get(id);
    await todo.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: 'Todo não encontrada' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});