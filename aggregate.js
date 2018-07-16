/**
 * Aggregates GDP and Population Data by Continents
 * @param {*} filePath
 */
const fs = require('fs');

const aggregate = (filePath) => {
  const contents = fs.readFileSync(filePath, 'utf8');
  const arrOfContents = contents.split('\n');
  const arrOfJsonObjects = [];

  for (let i = 1; i < arrOfContents.length; i += 1) {
    const countryInfoArray = arrOfContents[i].split(',');
    arrOfJsonObjects.push(countryInfoArray);
  }
  const countryContinentArray = [];
  const contentsOfText = fs.readFileSync('./data/cc-mapping.txt', 'utf8');
  const arrOfContentsOfText = contentsOfText.split('\n');
  arrOfContentsOfText.forEach((element) => {
    countryContinentArray.push(element.split(','));
  });
  const countryContinentMap = new Map(countryContinentArray);
  const countryContinentMapping = new Map();
  arrOfJsonObjects.pop();
  arrOfJsonObjects.pop();
  arrOfJsonObjects.forEach((element) => {
    countryContinentMapping.set(element[0].slice(1, -1), countryContinentMap
      .get(element[0].slice(1, -1)));
  });
  const countryGDP = new Map();
  const countryPopulation = new Map();
  const aggregateGDP = new Map();
  const aggregatePopulation = new Map();

  arrOfJsonObjects.forEach(
    (element) => {
      countryPopulation.set(element[0].slice(1, -1), element[4].slice(1, -1));
      countryGDP.set(element[0].slice(1, -1), element[7].slice(1, -1));
    },
  );

  countryContinentMapping.forEach((value, key) => {
    if (aggregatePopulation.has(value)) {
      aggregatePopulation.set(value, parseFloat(countryPopulation
        .get(key)) + parseFloat(aggregatePopulation.get(value)));
    } else {
      aggregatePopulation.set(value, parseFloat(countryPopulation.get(key)));
    }
    if (aggregateGDP.has(value)) {
      aggregateGDP.set(value, parseFloat(countryGDP
        .get(key)) + parseFloat(aggregateGDP.get(value)));
    } else {
      aggregateGDP.set(value, parseFloat(countryGDP.get(key)));
    }
  });
  const outputJSON = {};
  aggregateGDP.forEach((value, key) => {
    outputJSON[key] = {
      GDP_2012: value,
      POPULATION_2012: aggregatePopulation.get(key),
    };
  });
  fs.writeFileSync('./output/output.json', JSON.stringify(outputJSON));
};
module.exports = aggregate;
