javascript:(() => {

  const baseURL = 'http://localhost:5432';
  const writeDelay = 800;
  const cns = $('input').eq(5).val().trim();

  $.get(`${baseURL}/get/${cns}`, response => {

    console.log(response);

    if (response.error) {
      switch(response.error) {
        case 'ETIMEDOUT':
        case 'DISCONNECTED':
        case 'CNS':
        case 'COOKIE_EXPIRED':
        case 'UNDEFINED':
          alert(`[${response.error}] ${response.description}`);
      }

      return false;
    }

    let text_fields = {
      nome: 9,
      nascimento: 13,
      mae: 23,
      pai: 25,
    };

    let radio_fields = {
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

    let default_radio_schema = [
      23, 46,
      50, 52, 54, 56, 58, 64,
      70, 74, 76,
      79, 81, 83, 85, 87, 89, 91, 93,
      95, 97, 99,
      101, 103, 105, 107, 109, 111, 113,
      117
    ];
   
    /* Fill text fields */
    for(field in text_fields) {
      textField = $('input')[ text_fields[field] ];
      textField.focus();
      textField.value = response[field];

      /* Search for null values */
      let index = (field === 'mae') ? 24 : 26;
      
      if (response[field] == null) {
        $('input').eq(index).click();
      }
    };

    /* Fill null radios buttons */
    for(field in radio_fields) {

      if (response[field] != null) {
        let key = response[field].toLowerCase();
        let index = radio_fields[field][key];
        $('input').eq(index).click();
      }
    };

    /* Check questionary radios */
    default_radio_schema.forEach(index => $('input[type="radio"]').eq(index).click());

    /* Focus to city input, and call type action */
    setTimeout(() => {

      const city = response.municipio.split(' - ')[0];

      $('input')[33].focus();

      $.get(`${baseURL}/type/${ city }`, response => {
        console.log(response);
      });
    }, writeDelay);
    
  });
})()