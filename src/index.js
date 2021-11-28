const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

// #region functionChecksExistsUserAccount

/**
 * ? Middleware checkExistsUserAccount. 
 * ? Pega o username do usuário no header da requisição, 
 * ? verifica se esse usuário existe e então 
 * ? coloca esse usuário dentro da request antes de chamar a função next. 
 * ? Caso o usuário não seja encontrado, 
 * ? você deve retornar uma resposta contendo status 404 e um json ninformadno que o usuário não existe.
 */

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(400).json({ error: 'Usuário não encontrado!' });
  }

  request.user = user;

  return next();
}

// #endregion functionChecksExistsUserAccount

// #region postUsers
/**
 * ? Deve ser possível criar um novo usuário.
 * ? Permitir que um usuário seja criado e retorne um JSON com o usuário criado. 
 * ? Também é necessário que você retorne a resposta com o código '201'.
 * ? Antes de criar um usuário você deve validar se outro usuário com o mesmo `username` já existe. 
 * ? Caso exista, retorne uma resposta com status `400` e um json informado que o usuário já existe
 */

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usernameAlreadyExists = users.find(
    user => user.username === username
  );

  if (usernameAlreadyExists) {
    return response.status(400).json({ error: "Usuário já cadastrado!" });
  }

  const user = ({
    id: uuidv4(),
    name,
    username,
    todos: [],
  });

  users.push(user);

  return response.status(201).json(user);

});

// #endregion

// #region getTodos

/**
 * ? Deve ser possível listar todos os 'todos' do usuário
 * ? É necessário pegar o usuário que foi repassado para 
 * ? o request no middleware checkExistsUserAccount 
 * ? e retornar a lista todos que está no objeto do usuário.
 */

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const { user } = request;
  return response.json(user.todos);

});

// #endregion getTodos

// #region postTodos

/**
 * ? É necessário pegar o usuário que foi repassado para 
 * ? o request no middleware checkExistsUserAccount, 
 * ? pegar também o `title` e o `deadline` do corpo da requisição 
 * ? e adicionar um novo 'todo' na lista 'todos' que está no objeto do usuário.  
 * ? Após adicionar o novo 'todo' na lista, é necessário retornar um status 201 
 * ? e o 'todo' no corpo da resposta.'
 */

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);

});

// #endregion postTodos

// #region putTodos

/** 
 * ? Deve ser possívle atualizar um 'todo'
 * ? Na rota PUT '/todos/:id' é necessário atualizar um 'todo' existente, 
 * ? recebendo o 'title' e o 'deadline' pelo corpo da requisição 
 * ? e o 'id' presente nos parâmetros da rota.
 * ? Não deve ser possível alterar um 'todo' não existente
 * ? e deve retornar uma resposta cintendi um status 404 e um json informando a mensagem de erro
 */

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = user.todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: 'TODO não encontrado!' });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);

});

// #endregion putTodos

// #region patchTodos

/**
 * ? Deve ser possível marcar um 'todo' como feito
 * ? Na rota PATCH /todos/:id/done você deve mudar 
 * ? a propriedade done de um todo de false para true, 
 * ? recebendo o id presente nos parâmetros da rota.
 * ? Não deve permitir que um 'todo' não existente
 * ? seja marcado como done
 */

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: 'TODO não encontrado!' });
  }

  todo.done = true;

  return response.json(todo);
});

// #endregion

// #region deleteTodo

/**
 * ? Para que esse teste passe, DELETE /todos/:id você deve permitir 
 * ? que um todo seja excluído usando o id passado na rota. 
 * ? O retorno deve ser apenas um status 204 
 * ? que representa uma resposta sem conteúdo.
 * ? Não eve ser permitido excluir um 'todo' inexistente.
 */

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: 'TODO não encontrado!' });
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).json();

});

// #endregion

module.exports = app;