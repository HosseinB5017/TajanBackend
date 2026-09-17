const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

require('./models/User');
const User = require('./models/User');
const Withdrawal = require('./models/Withdrawal');

const app = express();
app.use(express.json());
const baseRouter = require('./Route/BaseMiddleware');
app.use('/', baseRouter);

async function test() {
    await mongoose.connect(process.env.MONGODB_URI);
    const server = app.listen(3019);

    const admin = await User.findOne({ username: 'admin' });
    const token = jwt.sign({ id: admin._id, isAdmin: true, role: 'admin' }, process.env.JWT_SEC || 'test');

    const firstDoc = await Withdrawal.findOne({}).populate('user');
    console.log('Testing with doc _id:', firstDoc._id.toString(), 'and id:', firstDoc.id);

    const makeRequest = (url) => new Promise((resolve, reject) => {
        http.get('http://localhost:3019' + url, {
            headers: { 'token': 'Bearer ' + token }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch(e) {
                    resolve({ status: res.statusCode, raw: data });
                }
            });
        }).on('error', reject);
    });

    // 1. Test GET /withdrawal/:id with _id
    const res1 = await makeRequest('/withdrawal/' + firstDoc._id);
    console.log('GET /withdrawal/:_id status:', res1.status);
    console.log('Response 1 data:', JSON.stringify(res1.body, null, 2));

    // 2. Test GET /withdrawal/:id with numeric id
    const res2 = await makeRequest('/withdrawal/' + firstDoc.id);
    console.log('GET /withdrawal/:id status:', res2.status);
    console.log('Response 2 data:', JSON.stringify(res2.body, null, 2));

    // 3. Test GET /withdrawal/nonexistent -> 404
    const res3 = await makeRequest('/withdrawal/65f123abc45665f123abc456');
    console.log('GET /withdrawal/nonexistent status:', res3.status, res3.body);

    // 4. Test GET /withdrawal/?status=pending&page=1&perpage=10&id=-1
    const res4 = await makeRequest('/withdrawal/?status=pending&page=1&perpage=10&id=-1');
    console.log('GET /withdrawal/?status=pending&page=1&perpage=10&id=-1 status:', res4.status);
    console.log('List data items count:', res4.body.data?.length);

    // 5. Test GET /withdrawal/?page=1&perpage=10&id=-1 (all)
    const res5 = await makeRequest('/withdrawal/?page=1&perpage=10&id=-1');
    console.log('All list items ids sorted desc:', res5.body.data?.map(d => ({ _id: d._id, id: d.id })));

    server.close();
    await mongoose.disconnect();
    process.exit(0);
}

test().catch(err => {
    console.error('Test error:', err);
    process.exit(1);
});
