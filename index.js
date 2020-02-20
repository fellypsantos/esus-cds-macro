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
const execute = require('child_process').execFile;
const cors = require('cors');
const server = express().use(cors());
const queryServerIP = '192.168.1.111';

server.get('/get/:cns', async (req, res) => {

  // send request to CDS-SERVER
  // 700404961466647 - FELLYP | TEST

  const { cns } = req.params;
  const { data: response } = await axios.get(`http://${ queryServerIP }:5433/get/${cns}/${computer.toUpperCase()}`);

  console.log('Resposta: ', response);

  res.send(response);
});

server.get('/type/:city', async (req, res) => {

  let { city } = req.params;

  execute( 'script.exe', [ city ] , (err, data) => {
    if (err) { console.log(err); }
    console.log( `[DIGITADO] ${data.toString()}\n` );
  });

  return res.json({ typed: city });
});

server.listen(5432, () => {
  console.log('Servidor rodando!');
  console.log('Aproveite a digitação de fichas kkkk ...\n');
})