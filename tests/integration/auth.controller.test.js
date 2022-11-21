const httpMocks = require('node-mocks-http');
const mongoose = require("mongoose");
require('dotenv').config();

const authController = require('../../controllers/auth.controller');

let req, res, next;
beforeAll(async () => {
	req = httpMocks.createRequest();
	res = httpMocks.createResponse();
	next = null;
	await mongoose.connect(`mongodb+srv://${process.env.USERMONGODB}:${process.env.PASSWORDMONGODB}@${process.env.HOSTMONGODB}/${process.env.MONGODBNAME}?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
})

describe("/register", () => {
	test('POST', async () => {
		function makeid(length) {
			var result           = '';
			var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			var charactersLength = characters.length;
			for ( var i = 0; i < length; i++ ) {
			  result += characters.charAt(Math.floor(Math.random() * 
		 charactersLength));
		   }
		   return result;
		}

		req.body = {
		  lastname: 'DOE',
		  firstname: 'John',
		  username: `john.doe${makeid(5)}`,
		  birthday: '1995-10-10',
		  password: '12341234',
		  email: `john.doe${makeid(5)}@toto.fr`,
		  city: 'Reims'
		}

		await authController.register(req, res, next);

		expect(res.statusCode).toBe(200);
	});
});