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
const server = express().use(cors());
const queryServerIP = 'localhost';

server.get('/get/:id', async (req, res) => {

  // send request to CDS-SERVER
  // 700404961466647 - FELLYP | TEST

  const { id } = req.params;
  console.log(`\n\n[CONSULTAR] ${id} ...`)

  try {
    const { data: response } = await axios.get(`http://${ queryServerIP }:5433/get/${id}/${computer.toUpperCase()}`);

    console.log('[RESULTADO]: ', response);
    return res.send(response);
  }
  catch(error) {
    console.log('consulta: ', error.message);
    return res.send('Erro desconhecido');
  }

});

server.listen(5432, () => {
  console.log('Servidor rodando!');
  console.log('Aproveite a digitação de fichas kkkk ...');
});