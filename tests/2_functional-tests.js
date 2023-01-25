const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const mongoose = require('mongoose');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    this.timeout(20000);
    suite('All 14 functional tests are complete and passing.', () => {
        let issue_id;
        test('1. Create an issue with every field: POST request to /api/issues/{project}', (done) => {
            chai.request(server)
                .post('/api/issues/functional_test')
                .send({ "issue_title": "test_title", "issue_text": "test_text", "created_by": "test_created", "assigned_to": "test_assigned", "status_text": "test_status" })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.isTrue(mongoose.isValidObjectId(res.body._id));
                    assert.equal(res.body.issue_title, "test_title");
                    assert.equal(res.body.issue_text, "test_text");
                    assert.equal(res.body.created_by, "test_created");
                    assert.equal(res.body.assigned_to, "test_assigned");
                    assert.equal(res.body.status_text, "test_status");
                    assert.property(res.body, "created_on");
                    assert.property(res.body, "updated_on");
                    assert.isBoolean(res.body.open);
                    assert.isTrue(res.body.open);
                    issue_id = res.body._id;
                    done();
                });

        });
        test('2. Create an issue with only required fields: POST request to /api/issues/{project}', (done) => {
            chai.request(server)
                .post('/api/issues/functional_test')
                .send({ "issue_title": "test_title", "issue_text": "test_text", "created_by": "test_created" })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.isTrue(mongoose.isValidObjectId(res.body._id));
                    assert.equal(res.body.issue_title, "test_title");
                    assert.equal(res.body.issue_text, "test_text");
                    assert.equal(res.body.created_by, "test_created");
                    assert.equal(res.body.assigned_to, "");
                    assert.equal(res.body.status_text, "");
                    assert.property(res.body, "created_on");
                    assert.property(res.body, "updated_on");
                    assert.isBoolean(res.body.open);
                    assert.isTrue(res.body.open);
                    done();
                });

        });
        test('3. Create an issue with missing required fields: POST request to /api/issues/{project}', (done) => {
            chai.request(server)
                .post('/api/issues/functional_test')
                .send({ "issue_title": "test_title", "issue_text": "test_text" })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.property(res.body, "error");
                    assert.equal(res.body.error, 'required field(s) missing');
                    done();
                });

        });
        test('4. View issues on a project: GET request to /api/issues/{project}', (done) => {
            chai.request(server)
                .get('/api/issues/functional_test')
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.typeOf(res.body, 'array');
                    res.body.forEach(item => {
                        assert.isTrue(mongoose.isValidObjectId(item._id));

                    });
                    done();
                });
        });
        test('5. View issues on a project with one filter: GET request to /api/issues/{project}', (done) => {
            chai.request(server)
                .get('/api/issues/functional_test?open=true')
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.typeOf(res.body, 'array');
                    res.body.forEach(item => {
                        assert.isTrue(mongoose.isValidObjectId(item._id));
                        assert.isTrue(item.open);
                    });
                    done();
                });
        });
        test('6. View issues on a project with multiple filters: GET request to /api/issues/{project}', (done) => {
            chai.request(server)
                .get('/api/issues/functional_test?open=true&issue_text=test_text')
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.typeOf(res.body, 'array');
                    res.body.forEach(item => {
                        assert.isTrue(mongoose.isValidObjectId(item._id));
                        assert.isTrue(item.open);
                        assert.equal(item.issue_text, "test_text");
                    });
                    done();
                });
        });
        test('7. Update one field on an issue: PUT request to /api/issues/{project}', (done) => {
            chai.request(server)
                .put('/api/issues/functional_test')
                .send({ _id: issue_id, "issue_text": "test_text2" })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.property(res.body, 'result');
                    assert.equal(res.body.result, 'successfully updated');
                    assert.property(res.body, '_id');
                    assert.isTrue(mongoose.isValidObjectId(res.body._id));
                    done();
                });
        });
        test('8. Update multiple fields on an issue: PUT request to /api/issues/{project}', (done) => {
            chai.request(server)
                .put('/api/issues/functional_test')
                .send({ _id: issue_id, "issue_title": "test_title2", "issue_text": "test_text2-2" })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.equal(res.body.result, 'successfully updated');
                    assert.property(res.body, '_id');
                    assert.isTrue(mongoose.isValidObjectId(res.body._id));
                    done();
                });
        });
        test('9. Update an issue with missing _id: PUT request to /api/issues/{project}', (done) => {
            chai.request(server)
                .put('/api/issues/functional_test')
                .send({ "issue_title": "test_title2", "issue_text": "test_text2-2" })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.property(res.body, 'error');
                    assert.equal(res.body.error, 'missing _id');
                    done();
                });
        });
        test('10. Update an issue with no fields to update: PUT request to /api/issues/{project}', (done) => {
            chai.request(server)
                .put('/api/issues/functional_test')
                .send({ _id: issue_id })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.property(res.body, 'error');
                    assert.equal(res.body.error, 'no update field(s) sent');
                    done();

                });
        });
        test('11. Update an issue with an invalid _id: PUT request to /api/issues/{project}', (done) => {
            chai.request(server)
                .put('/api/issues/functional_test')
                .send({ _id: 'test_id', "issue_title": "test_title2", "issue_text": "test_text2-2" })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.property(res.body, 'error');
                    assert.equal(res.body.error, 'could not update');
                    assert.property(res.body, '_id');
                    assert.equal(res.body._id, 'test_id');
                    done();

                });
        });
        test('12. Delete an issue: DELETE request to /api/issues/{project}', (done) => {
            chai.request(server)
                .delete('/api/issues/functional_test')
                .send({ _id: issue_id })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.property(res.body, 'result');
                    assert.equal(res.body.result, 'successfully deleted');
                    assert.property(res.body, '_id');
                    assert.equal(res.body._id, issue_id);
                    done();

                });
        });
        test('13. Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', (done) => {
            chai.request(server)
                .delete('/api/issues/functional_test')
                .send({ _id: "test_id" })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.property(res.body, 'error');
                    assert.equal(res.body.error, 'could not delete');
                    assert.property(res.body, '_id');
                    assert.equal(res.body._id, "test_id");
                    done();

                });
        });
        test('14. Delete an issue with missing _id: DELETE request to /api/issues/{project}', (done) => {
            chai.request(server)
                .delete('/api/issues/functional_test')
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.type, 'application/json');
                    assert.property(res.body, 'error');
                    assert.equal(res.body.error, 'missing _id');
                    done();

                });
        });

    })
});
