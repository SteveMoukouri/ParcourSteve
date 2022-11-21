const fs = require('fs');
const parse = require('csv-parse');
const mongoose = require('mongoose');
ObjectId = mongoose.Types.ObjectId
const axios = require('axios').default;

module.exports = class GlobalFunc {
	constructor() { }

	static replaceSpecialChars(string) {
		string = string.replace(/[ÀÁÂÃÄÅ]/g, "A");
		string = string.replace(/[àáâãäå]/g, "a");
		string = string.replace(/[ÈÉÊË]/g, "E");
		string = string.replace(/[èéêë]/g, "e");
		string = string.replace(/[Ç]/g, "C");
		string = string.replace(/[ç]/g, "c");
		string = string.replace(/[']/g, " ");


		return string.toLowerCase();
	}

	static async asyncForEach(array, callback) {
		for (let index = 0; index < array.length; index++) {
			await callback(array[index], index, array);
		}
	}

	static capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	static csvParse(inputFile, delimiter = ',') {
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
					}, function (error, rows) {
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

	static calcCrow(lat1, lon1, lat2, lon2) {
		var R = 6371; // km
		var dLat = toRad(lat2 - lat1);
		var dLon = toRad(lon2 - lon1);
		var lat1 = toRad(lat1);
		var lat2 = toRad(lat2);

		var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var d = R * c;
		return d;

		// Converts numeric degrees to radians
		function toRad(Value) {
			return Value * Math.PI / 180;
		}
	}

	static getLocation(address) {
		return new Promise((resolve, reject) => {
			axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
				params: {
					address: address,
					key: process.env.GOOGLE_GEOCODE_APIKEY
				}
			})
				.then(function (response) {
					if (response.data.results.length > 0) {
						const location = response.data.results[0].geometry.location;
						resolve({ lat: location.lat, lng: location.lng });
					} else {
						reject(new Error('Aucune position trouvée'));
					}
				})
				.catch(function (error) {
					reject(error);
				});
		})
	}

	static isValidObjectId(id){
    
		if(ObjectId.isValid(id)){
			if((String)(new ObjectId(id)) === id)
				return true;
			return false;
		}
		return false;
	}
}