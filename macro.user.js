// ==UserScript==
// @name         eSUS Macro de Consultas
// @namespace    https://github.com/fellypsantos/esus-cds-macro
// @version      1.1
// @description  Controla as requisições ao servidor de consultas de dados, e interações com o usuário.
// @author       Fellyp Santos
// @match        http://**/esus/*
// @grant        none
// ==/UserScript==

let $;
let Ext;
let textInputs;

let Snackbar = {
  created: false,
  element: null,
  init: () => {
    if (Snackbar.created) return;

    let style = document.createElement('style');
    let snackbarElement = document.createElement('div');

    // configure style and toast
    style.type = 'text/css';
    style.innerHTML = '/* The snackbar - position it at the bottom and in the middle of the screen */ #snackbar { visibility: hidden; /* Hidden by default. Visible on click */ min-width: 250px; /* Set a default minimum width */ margin-left: -125px; /* Divide value of min-width by 2 */ background-color: #333; /* Black background color */ color: #fff; /* White text color */ text-align: center; /* Centered text */ border-radius: 2px; /* Rounded borders */ padding: 16px; /* Padding */ position: fixed; /* Sit on top of the screen */ z-index: 1; /* Add a z-index if needed */ left: 50%; /* Center the snackbar */ bottom: 30px; /* 30px from the bottom */ font-size: 16px; } /* Show the snackbar when clicking on a button (class added with JavaScript) */ #snackbar.show { visibility: visible; /* Show the snackbar */ /* Add animation: Take 0.5 seconds to fade in and out the snackbar. However, delay the fade out process for 2.5 seconds */ -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s; animation: fadein 0.5s, fadeout 0.5s 2.5s; } /* Animations to fade the snackbar in and out */ @-webkit-keyframes fadein { from {bottom: 0; opacity: 0;} to {bottom: 30px; opacity: 1;} } @keyframes fadein { from {bottom: 0; opacity: 0;} to {bottom: 30px; opacity: 1;} } @-webkit-keyframes fadeout { from {bottom: 30px; opacity: 1;} to {bottom: 0; opacity: 0;} } @keyframes fadeout { from {bottom: 30px; opacity: 1;} to {bottom: 0; opacity: 0;} }';
    snackbarElement.id = 'snackbar';
    snackbarElement.innerHTML = 'Hello World';

    document.getElementsByTagName('head')[0].appendChild(style); // inject style
    document.getElementsByTagName('body')[0].appendChild(snackbarElement); // create toast

    Snackbar.element = snackbarElement;
    Snackbar.created = true;
  },
  show: message => {
    $(Snackbar.element).html(message);
    $(Snackbar.element).addClass('show');
    setTimeout(() => $(Snackbar.element).removeClass('show'), 3000);
  }
};

const targetPage = /cds\/user\/cadastroIndividual\/detail?/;
const baseURL = 'http://localhost:5432';

const text_fields = {
  nome: 9,
  nascimento: 13,
  mae: 23,
  pai: 25,
};

const radio_fields = {
  nacionalidade: {
    "brasileira": 27,
    "naturalizado": 28,
    "estrangeiro": 29,
  },
  sexo: {
    "feminino": 14,
    "masculino": 15
  },
  cor: {
    "branca": 16,
    "preta": 17,
    "parda": 18,
    "amarela": 19,
    "indigena": 20,
  }
};

const default_radio_schema = [
  23, 46,
  50, 52, 54, 56, 58, 64,
  70, 74, 76,
  79, 81, 83, 85, 87, 89, 91, 93,
  95, 97, 99,
  101, 103, 105, 107, 109, 111, 113,
  117
];

const fillUserInformation = response => {

  /* Fill text fields */
  for (let field in text_fields) {
    let textField = $('input')[text_fields[field]];
    textField.focus();
    textField.value = response[field];

    /* Search for null values */
    let index = (field === 'mae') ? 24 : 26;

    /* Check field 'DESCONHECIDO' */
    if (response[field] == null) $('input').eq(index).click();
  };

  /* Fill null radios buttons */
  for (let field in radio_fields) {
    if (response[field] != null) {
      let key = response[field].toLowerCase();
      let index = radio_fields[field][key];
      $('input').eq(index).click();
    }
  };

  /* Check default radios */
  default_radio_schema.forEach(index => $('input[type="radio"]').eq(index).click());

  /* Focus to city name input */
  $('input')[33].focus();
}

const handleSearchCNS = async cnsField => {
  const cns = cnsField.val();

  if (cns.length == 0) return;

  try {
    console.log(`Buscar por: ${cns}`);
    Snackbar.show('Pesquisando usuário...');
    const timer = setTimeout(() => Snackbar.show('Ainda procurando...'), 15000);
    const response = await $.ajax({ url: `${baseURL}/get/${cns}`, timeout: 30000, success: () => clearTimeout(timer) });

    // Error
    if (response.error) {
      Ext.MessageBox.alert('Ocorreu um erro', `${response.description}`);
      return;
    }

    // Success
    Snackbar.show('Encontrado!');
    fillUserInformation(response);
    console.log(response);
  }
  catch (error) {
    console.log('Erro na requisição: ', error);

    if (error.statusText == 'timeout') {
      Ext.MessageBox.alert('Ocorreu um erro.', 'O Servidor local demorou muito pra responder, tente novamente.');
    }
  }
}

const handleSearchByName = async nameField => {
  const name = nameField.val();

  if (name.length == 0) return;

  try {
    const response = await $.ajax(`${baseURL}/search/fellypsantos/10-07-1995`);
  }
  catch(error){
    console.error('ocorreu um errro: ', error.statusText);
  }
}

const main = () => {
  if (location.hash.search(targetPage) == -1) return;

  $ = window.$;
  Ext = window.Ext;
  textInputs = $('input[type=text]');
  Snackbar.init();

  const cns = textInputs.eq(5);
  const name = textInputs.eq(7);

  // resize the inputs to place buttons beside
  cns.css({ width: '120px' });
  name.css({ width: '550px' });

  // add button to fetch user data
  $('<button>Consultar</button>')
    .addClass(' x-form-button x-form-field ')
    .css({ position: 'absolute', top: '16px', left: '132px' })
    .insertAfter(cns)
    .click(() => handleSearchCNS(cns));

  // add button to search user by name and birthday
  $('<button>Buscar usuário por nome</button>')
    .addClass(' x-form-button x-form-field ')
    .css({ position: 'absolute', top: '16px', left: '565px' })
    .insertAfter(name)
    .click(() => handleSearchByName(name));
}

window.onhashchange = () => main();