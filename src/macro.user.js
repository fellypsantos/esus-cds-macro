// ==UserScript==
// @name         eSUS Macro de Consultas
// @namespace    https://github.com/fellypsantos/esus-cds-macro
// @version      1.7
// @description  Controla as requisições ao servidor de consultas de dados, e interações com o usuário.
// @author       Fellyp Santos
// @match        http://**/esus/*
// @grant        none
// ==/UserScript==

let $;
let Ext;
let textInputs;
let winSearchResult;
let saveButtonPressed = false;

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

const Text = {
  btnConsultarCNS: 'Consultar',
  btnConsultarPorNome: 'Procurar por Nome'
}

const text_fields = {
  cns: 5,
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

const resetUIButtons = () => {
  $('#btnConsultarCNS').removeAttr('disabled').html(Text.btnConsultarCNS);
  $('#btnConsultarPorNome').removeAttr('disabled').html(Text.btnConsultarPorNome);
}

const formatCNS = cns => cns.replace(/^(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');

const showSearchResultWindow = response => {

  let htmlList = '';

  if (response.length == 0) {
    Ext.MessageBox.alert('Resultado da busca', 'Nenhum usuário encontrado.');
    return;
  }

  response.map(user => {
    htmlList += `<li>
        <a href="javascript:void(0)" data-cns="${user.cns}">
          <div class="user">
            <h5><b>${ formatCNS(user.cns) }</b></h5>
            <p><b>Nome: </b>${user.nome}</p>
            <p><b>Mãe: </b>${user.mae || 'SEM INFORMAÇÃO'}</p>
            <p><b>Nascido em: </b>${user.municipio || 'SEM INFORMAÇÃO'}</p>
            <p><b>No dia: </b>${user.nascimento || 'SEM INFORMAÇÃO'}</p>
          </div>
        </a>
      </li>`;
  });

  winSearchResult = new Ext.Window({
    id: 'search-result',
    title: 'Resultado da busca',
    modal: true,
    width: 450,
    height: 400,
    layout: 'fit',
    items: {
      xtype: 'panel',
      closable: true,
      autoScroll: true,
      html: `<ul class="searchResult">${ htmlList }</ul>`
    }
  });

  winSearchResult.show();
}

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

const handleSearchCNS = async cns => {

  if (cns.length == 0) return;

  console.log(`Buscar por: ${cns}`);
  Snackbar.show('Pesquisando usuário...');
  $('#btnConsultarCNS').attr('disabled', '').html('Aguarde..');

  try {
    const timer = setTimeout(() => Snackbar.show('Ainda procurando...'), 15000);
    const response = await $.ajax({ url: `${baseURL}/get/${cns}`, timeout: 30000, success: () => clearTimeout(timer) });

    // Error
    if (response.error || response == "Erro desconhecido") {
      Ext.MessageBox.alert('Ocorreu um erro', `${response.description || response}`);
      console.error('Error details: ', response);
      return;
    }

    // Success
    Snackbar.show('Encontrado!');
    fillUserInformation(response);
    console.log(response);
  }
  catch (error) {
    console.log('Erro na requisição: ', error);
    if (error.statusText == 'error') {
      return Ext.MessageBox.alert('Ocorreu um erro.', 'Parece que o servidor local não foi iniciado.');
    }

    if (error.statusText == 'timeout') {
      return Ext.MessageBox.alert('Ocorreu um erro.', 'O Servidor local demorou muito pra responder, tente novamente.');
    }
  }
  finally {
    resetUIButtons();
  }
}

const handleSearchByName = async (nameField, birthdayField, motherField) => {
  const name = nameField.val();
  const birthday = birthdayField.val();
  const mother = motherField.val();

  if (name.length == 0) return;
  Snackbar.show('Procurando usuário por nome...');
  $('#btnConsultarPorNome').attr('disabled', 'disabled').html('Buscando, aguarde...');

  try{
    const response = await $.ajax({
      type: 'POST',
      url: `${baseURL}/search`,
      timeout: 30000,
      contentType: 'application/json',
      data: JSON.stringify({ name, birthday, mother })
    });

    if (response.error) {
      Ext.MessageBox.alert('Ocorreu um erro', 'Problemas na consulta aos dados.');
      console.error('Error details: ', response);
      return;
    }

    console.log('Search by name: ', response);
    Snackbar.show('A busca terminou!');
    showSearchResultWindow(response);
  }
  catch(error){
    console.warn('ocorreu um errro: ', error.statusText);
    Ext.MessageBox.alert('Ocorreu um erro: ', `${error.statusText}`);
  }
  finally {
    console.log('Reativar botao');
    resetUIButtons();
  }
}

const initSearchTemplate = () => {
  let style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = 'ul.searchResult{list-style:none}.searchResult>li>a{display:block;padding:10px;border-bottom:1px solid #ccc;text-decoration:none!important;color:#333}.searchResult li a:hover{background-color:#e0edff;}.searchResult.user>:first-child{font-size:20px;font-weight:700}';
  document.getElementsByTagName('head')[0].appendChild(style);
}

const handleSelectSearch = element => {
  const cns = $(element).data('cns').toString();

  // Fill the CNS input
  $('input[type=text]').eq(5).val(cns);

  // Click to start search
  $('button').eq(0).click();

  // Close the search result window
  winSearchResult.close();
}

const addLog = async () => {

  let cad_type = '';

  if (location.hash.indexOf('cadastroIndividual?') > -1) {
    // configura post do cadastro individual
    cad_type = 'cad_i';
  }
  else if(location.hash.indexOf('cadastroDomiciliar?') > -1) {
    cad_type = 'cad_d';
  }

  // após dados configurados, enviar o post
  console.log('Solicitando salvamento de log...');

  try {
    const response = await $.ajax({
      type: 'POST',
      url: `${baseURL}/log`,
      timeout: 30000,
      contentType: 'application/json',
      data: JSON.stringify({ cad_type })
    });
  }
  catch(error){
    console.log('Ocorreu um erro na rota /log', error.statusText);
  }
}

const getSaveButton = () => new Promise((resolve, reject) => {
  const timer = setInterval(() => {
    const button = $('button.simple-btn.border.round.shadow.rodape.positivo');
    if (button[1].innerText == 'Salvar') {
      clearInterval(timer);
      resolve(button[1]);
    }
    else {
      reject('save_button_not_found');
    }
  }, 250);
});

const main = async () => {

  if (saveButtonPressed) {
    console.log('parece que salvou um cadastro');
    saveButtonPressed = false;
    await addLog();
  }

  if (location.hash.search(targetPage) == -1) return;

  console.log('rodando main()');

  $ = window.$;
  Ext = window.Ext;
  textInputs = $('input[type=text]');
  Snackbar.init();
  initSearchTemplate();

  const cns = textInputs.eq(5);
  const name = textInputs.eq(7);
  const birthday = textInputs.eq(10);
  const mother = textInputs.eq(13);

  // resize the inputs to place buttons beside
  cns.css({ width: '120px' });
  name.css({ width: '550px' });

  // add button to fetch user data
  $(`<button id="btnConsultarCNS">${Text.btnConsultarCNS}</button>`)
    .addClass(' x-form-button x-form-field ')
    .css({ position: 'absolute', top: '16px', left: '132px' })
    .insertAfter(cns)
    .click(() => handleSearchCNS(cns.val()));

  // add button to search user by name and birthday
  $(`<button id="btnConsultarPorNome">${ Text.btnConsultarPorNome }</button>`)
    .addClass(' x-form-button x-form-field ')
    .css({ position: 'absolute', top: '16px', left: '565px' })
    .insertAfter(name)
    .click(() => handleSearchByName(name, birthday, mother));

  $(document).on('click', '.searchResult a', event => {
    event.stopPropagation();
    handleSelectSearch(event.currentTarget);
  });

  const saveButton = await getSaveButton();
  $(saveButton).click(() => {saveButtonPressed = true});
}

window.onhashchange = () => main();
window.onload = () => setTimeout(() => main(), 2000);
