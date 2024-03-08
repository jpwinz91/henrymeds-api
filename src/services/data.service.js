const fs = require('fs');
const path = require('path');
const JSONPATH = path.join(__dirname, '..', 'data.json');

/*
    The idea behind this service is to wrap whatever backend data store is being used.
    For the sake of this exercise, I am reading/writing to a local file but in a production scenario this would likely be wrapping a database client of some kind.
*/
const fetchData = function() {
    const rawFile = fs.readFileSync(JSONPATH);
    const data = JSON.parse(rawFile);
    return data;
}

const writeData = function(data) {
    fs.writeFileSync(JSONPATH, JSON.stringify(data, null, 4));
}

module.exports = {
    fetchData,
    writeData
}