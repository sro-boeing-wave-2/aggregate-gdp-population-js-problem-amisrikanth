/**
 * Aggregates GDP and Population Data by Continents
 * @param {*} filePath
 */
const fs = require('fs');

const countryToContinentMap = (dataOfCSV, dataOfMapping) => {
  const countryContinentMap = new Map(dataOfMapping);
  const countryContinentMapping = new Map();
  dataOfCSV.forEach((element) => {
    countryContinentMapping.set(element[0].slice(1, -1), countryContinentMap
      .get(element[0].slice(1, -1)));
  });
  return countryContinentMapping;
};

const readCSVFile = filePath => new Promise((resolve, reject) => {
  fs.readFile(filePath, 'utf8', (error, contents) => {
    if (error) {
      reject();
    } else {
      const arrOfContents = contents.split('\n');
      const arrOfCountryInfo = [];
      for (let i = 1; i < arrOfContents.length - 2; i += 1) {
        const countryInfoArray = arrOfContents[i].split(',');
        arrOfCountryInfo.push(countryInfoArray);
      }
      resolve(arrOfCountryInfo);
    }
  });
});

const readMappingFile = new Promise((resolve, reject) => {
  fs.readFile('./data/cc-mapping.txt', 'utf8', (error, contentsOfText) => {
    if (error) {
      reject(error);
    } else {
      const countryContinentArray = [];
      const arrOfContentsOfText = contentsOfText.split('\n');
      arrOfContentsOfText.forEach((element) => {
        countryContinentArray.push(element.split(','));
      });
      resolve(countryContinentArray);
    }
  });
});
const calculateAggregate = (data) => {
  const countryContinentMapping = countryToContinentMap(data[0], data[1]);
  const countryGDP = new Map();
  const countryPopulation = new Map();
  const aggregateGDP = new Map();
  const aggregatePopulation = new Map();
  data[0].forEach(
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
  return new Promise((resolve, reject) => {
    fs.writeFile('./output/output.json', JSON.stringify(outputJSON), (error) => {
      if (error === null) {
        resolve();
      } else {
        reject(error);
      }
    });
  });
};
const aggregate = filePath => new Promise((resolveOuter, rejectOuter) => {
  Promise.all([readCSVFile(filePath), readMappingFile])
    .then(data => calculateAggregate(data)).then(resolveOuter()).catch((error) => {
      if (error) {
        rejectOuter(error);
      }
    });
});

module.exports = aggregate;
