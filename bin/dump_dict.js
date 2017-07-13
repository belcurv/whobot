const dict = require('./dataDictionary');

for (let key in dict) {
  if (dict.hasOwnProperty(key)) {
    dict[key].forEach( (variant) => {
      console.log( '"' + variant + '" : "' + key + ',');
    });
  }
}
