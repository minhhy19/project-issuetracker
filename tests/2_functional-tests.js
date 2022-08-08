const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { ObjectId } = require("mongoose").Types;

chai.use(chaiHttp);

suite('Functional Tests', function() {
  this.timeout(5000);
  let testId;
  test('POST /api/issues/{project} with every field', function(done) {
    const request = {
      issue_title: "apitest",
      issue_text: "apitest",
      created_by: "apitest",
      assigned_to: "apitest",
      status_text: "apitest"
    };
    chai
      .request(server)
      .post('/api/issues/apitest')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(request)
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          testId = res.body._id;
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, request.issue_title);
          assert.equal(res.body.issue_text, request.issue_text);
          assert.equal(res.body.created_by, request.created_by);
          assert.equal(res.body.assigned_to, request.assigned_to);
          assert.equal(res.body.status_text, request.status_text);
          assert.equal(res.body.open, true);
          assert.isOk(res.body.created_on);
          assert.isOk(res.body.updated_on);
          assert.isOk(res.body._id);
          done(); 
        }
      })
  });

  test('POST /api/issues/{project} with only required fields', function(done) {
    const request = {
      issue_title: "apitest",
      issue_text: "apitest",
      created_by: "apitest"
    };
    chai
      .request(server)
      .post('/api/issues/apitest')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(request)
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, request.issue_title);
        assert.equal(res.body.issue_text, request.issue_text);
        assert.equal(res.body.created_by, request.created_by);
        assert.equal(res.body.assigned_to, "");
        assert.equal(res.body.status_text, "");
        assert.equal(res.body.open, true);
        assert.isOk(res.body.created_on);
        assert.isOk(res.body.updated_on);
        assert.isOk(res.body._id);
        done();
      })
  });

  test('POST /api/issues/{project} with missing required fields', function(done) {
    chai
      .request(server)
      .post('/api/issues/apitest')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({})
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        }
      })
  });

  test('GET /api/issues/{project} on a project', function(done) {
    chai
      .request(server)
      .get('/api/issues/apitest')
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.equal(res.status, 200);
          done();
        }
      })
  });

  test('GET /api/issues/{project} with one filter', function(done) {
    chai
      .request(server)
      .get('/api/issues/apitest?open=true')
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.equal(res.status, 200);
          done();
        }
      })
  });

  test('GET /api/issues/{project} with multiple filters', function(done) {
    chai
      .request(server)
      .get('/api/issues/apitest?open=true&issue_title="apitest"&issue_text="apitest"&created_by="apitest"')
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.equal(res.status, 200);
          done();
        }
      })
  });

  test('PUT /api/issues/{project} one field on an issue', function(done) {
    const updateId = testId;
    chai
      .request(server)
      .put('/api/issues/apitest')
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: updateId,
        issue_title: "test 2"
      })
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, updateId);
          done();
        }
      })
  });

  test('PUT /api/issues/{project} multiple fields on an issue', function(done) {
    const updateId = testId;
    chai
      .request(server)
      .put('/api/issues/apitest')
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: updateId,
        issue_title: "test 3",
        issue_text: "test 3",
        assigned_to: "test 3",
        created_by: "test 3",
        status_text: "test 3",
      })
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, updateId);
          done();
        }
      })
  });

  test('PUT /api/issues/{project} an issue with missing _id', function(done) {
    chai
      .request(server)
      .put('/api/issues/apitest')
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        issue_title: "test 4",
        issue_text: "test 4",
        assigned_to: "test 4",
        created_by: "test 4",
        status_text: "test 4",
      })
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "missing _id");
          done();
        }
      })
  });

  test('PUT /api/issues/{project} an issue with no fields to update', function(done) {
    const updateId = testId;
    chai
      .request(server)
      .put('/api/issues/apitest')
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: updateId
      })
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "no update field(s) sent");
          assert.equal(res.body._id, updateId);
          done();
        }
      })
  });

  test('PUT /api/issues/{project} an issue with no fields to update', function(done) {
    const invalidId = new ObjectId();
    chai
      .request(server)
      .put('/api/issues/apitest')
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: invalidId.toString(),
        issue_title: "test 6",
        issue_text: "test 6",
        assigned_to: "test 6",
        created_by: "test 6",
        status_text: "test 6",
      })
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "could not update");
          assert.equal(res.body._id, invalidId);
          done();
        }
      })
  });


  test('DELETE /api/issues/{project} an issue', function(done) {
    const deleteId = testId;
    chai
      .request(server)
      .delete('/api/issues/apitest')
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: deleteId
      })
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully deleted");
          assert.equal(res.body._id, deleteId);
          done();
        }
      })
  });

  test('DELETE /api/issues/{project} an issue with an invalid _id', function(done) {
    const invalidId = new ObjectId();
    chai
      .request(server)
      .delete('/api/issues/apitest')
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: invalidId.toString()
      })
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "could not delete");
          assert.equal(res.body._id, invalidId);
          done();
        }
      })
  });

  test('DELETE /api/issues/{project} an issue with missing _id', function(done) {
    chai
      .request(server)
      .delete('/api/issues/apitest')
      .set("content-type", "application/x-www-form-urlencoded")
      .send({})
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "missing _id");
          done();
        }
      })
  });
});
