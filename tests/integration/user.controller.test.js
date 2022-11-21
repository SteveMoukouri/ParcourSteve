const httpMocks = require('node-mocks-http');
const mongoose = require("mongoose");
require('dotenv').config();

const userController = require('../../controllers/user.controller');

let req, res, next;
beforeAll(async () => {
	req = httpMocks.createRequest();
	res = httpMocks.createResponse();
	next = null;
	await mongoose.connect(`mongodb+srv://${process.env.USERMONGODB}:${process.env.PASSWORDMONGODB}@${process.env.HOSTMONGODB}/${process.env.MONGODBNAME}?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
})

describe("/user/:username", () => {
	test('GET', async () => {
		req.params.username = 'FranckyVincent';
		req.headers = { userId: '626c1e80d68f0249187e613d' };

		await userController.get(req, res, next);

		expect(res.statusCode).toBe(200);
	});
});