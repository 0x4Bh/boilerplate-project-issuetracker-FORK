'use strict';
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const mySecret = process.env.MONGO_URI;
mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true });
const issueSchema = new mongoose.Schema({
  assigned_to: { type: String },
  status_text: { type: String },
  open: { type: Boolean, default: true },
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  created_on: { type: Date, default: new Date() },
  updated_on: { type: Date }
});

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(function (req, res) {
      let project = req.params.project;
      const ProjectModel = mongoose.model(project, issueSchema);
      ProjectModel.find(req.query).select("-__v").exec((err, data) => {
        if (err) console.log(err.stack);
        res.json(data);
      });

    })

    .post(function (req, res) {
      let project = req.params.project;

      let issue_title = req.body.issue_title;
      let issue_text = req.body.issue_text;
      let created_by = req.body.created_by;
      let assigned_to = req.body.assigned_to || '';
      let status_text = req.body.status_text || '';

      if (!issue_title || !issue_text || !created_by) {
        res.json({ error: 'required field(s) missing' });
      }
      else {
        const ProjectModel = mongoose.model(project, issueSchema);
        let anIssue = new ProjectModel({ issue_title, issue_text, created_by, assigned_to, status_text, updated_on: new Date() });
        anIssue.save((err, data) => {
          if (err) {
            console.log(err.stack);
            res.json({ error: 'required field(s) missing' });
          } else {
            const { assigned_to, status_text, open, _id, issue_title, issue_text, created_by, created_on, updated_on } = data;
            res.json({ assigned_to, status_text, open, _id, issue_title, issue_text, created_by, created_on, updated_on });
          }
        });
      }

    })

    .put(function (req, res) {
      let project = req.params.project;
      const ProjectModel = mongoose.model(project, issueSchema);
      let { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;
      let updateObj = { _id, issue_title, issue_text, created_by, assigned_to, status_text, open };
      Object.keys(updateObj).forEach(key => { if (updateObj[key] === '' || updateObj[key] === undefined || updateObj[key] === null) delete updateObj[key] });
      if (!_id) {
        res.json({ error: 'missing _id' });
      }
      else if (_id && !mongoose.isValidObjectId(_id)) {
        res.json({ "error": 'could not update', "_id": _id });
      }
      else if (Object.keys(updateObj).length < 2 && _id) {
        res.json({ error: 'no update field(s) sent', '_id': _id });
      }
      else {
        ProjectModel.findById(_id, (err, doc) => {
          if (err) {
            res.json({ "error": 'could not update', "_id": _id });
            return console.log(err.stack);
          }
          else {
            ProjectModel.updateOne({ _id }, {$set: { ...updateObj, updated_on: new Date() }}, (errSecond, result) => {
              if (errSecond || result.modifiedCount < 1) {
                res.json({ "error": 'could not update', "_id": _id });
                return console.log(errSecond);
              }
              else {
                res.json({ "result": 'successfully updated', "_id": _id });
              }
            });

          }
        });
      }
    })

    .delete(function (req, res) {
      let project = req.params.project;
      const ProjectModel = mongoose.model(project, issueSchema);
      let {_id} = req.body;
      if (!_id) {
        res.json({ error: 'missing _id' });
      }
      else if (!mongoose.isValidObjectId(_id)) {
        res.json({ error: 'could not delete', '_id': _id });
      }
      else {
        ProjectModel.findByIdAndDelete(_id, (err, doc) => {
          if (err) {
            console.log(err.stack);
            res.json({ error: 'could not delete', '_id': _id });
          }
          else {
            if (!doc) {
              res.send({ error: 'could not delete', '_id': _id });
            }
            else {
              res.json({ result: 'successfully deleted', '_id': _id });
            }
          }
        });
      }
    });

};
