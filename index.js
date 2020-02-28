/**
 * Server to run on each computer
 * This server will comunicate with the main nodeJS server
 * And receive the user information provided
 * http://main_server_IP_address:5433/
 * 
 * Author
 * https://github.com/fellypsantos/
 */

const computer = require('os').userInfo().username;
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const server = express().use(express.json()).use(cors());
const arguments = process.argv;
let paramServerIP = arguments.indexOf('--server');
let serverIP = (paramServerIP > 0) ? arguments[paramServerIP + 1] : 'localhost'

server.get('/get/:id', async (req, res) => {

  // send request to CDS-SERVER
  // 700404961466647 - FELLYP | TEST

  const { id } = req.params;
  console.log(`\n\n[CONSULTAR] ${id} ...`)

  try {
    const { data: response } = await axios.get(`http://${ serverIP }:5433/get/${id}/${computer.toUpperCase()}`);

    console.log('[RESULTADO]: ', response);
    return res.send(response);
  }
  catch(error) {
    console.log('consulta: ', error.message);
    return res.send('Erro desconhecido');
  }

});

server.post('/search/', async (req, res) => {

  const { name, birthday, mother } = req.body;

  console.log('Buscando por nome: ', name.toUpperCase());

  const searchResult = await axios.post(`http://${ serverIP }:5433/search`, {
    "name" : name.toUpperCase(),
    "birthday": birthday,
    "mother": mother.toUpperCase(),
  });
  
  const response = searchResult.data;

  if (response.error)
    console.log('Ocorreu um erro: ', response.description);
  else{
    console.log('Busca terminou sem erros.');
    console.log('Usuários encontrados: ', response.length);
  }

  console.log('\n* * * * * * * * * * * * * * * * * * * * *\n');

  return res.send( response );
});

server.listen(5432, () => {
  console.log(`[PRONTO] Servidor local rodando!`);
  console.log(`[PRONTO] Servidor principal rodando em: ${serverIP}`);
});