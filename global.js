const fs = require('fs');
const parse = require('csv-parse');

module.exports = class GlobalFunc {
    constructor() {}

    static replaceSpecialChars(string){
        string = string.replace(/[ÀÁÂÃÄÅ]/g,"A");
        string = string.replace(/[àáâãäå]/g,"a");
        string = string.replace(/[ÈÉÊË]/g,"E");
        string = string.replace(/[èéêë]/g,"e");
        string = string.replace(/[Ç]/g,"C");
        string = string.replace(/[ç]/g,"c");
        string = string.replace(/[']/g," ");


        return string;
    }

    static async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }

    static capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    static csvParse(inputFile, delimiter=',') {
        const parse2 = parse;
        return new Promise((resolve, reject) => {
          fs.readFile(inputFile, (error, fileData) => {
            if (error) {
              reject(error);
            } else {
              parse2(fileData, {
                columns: true,
                delimiter: delimiter,
                trim: true
              }, function(error, rows) {
                if (error) {
                  reject(error);
                } else {
                  resolve(rows);
                }
              });
            }
          });
        });
    }
}