const IssueModel = require("../models/issue.model");

const getIssues = async (req, res) => {
  const query = {
    project: req.params.project,
    ...req.query
  };

  const issues = await IssueModel.find(query);
  if (!issues) {
    return res.status(404).send(`No project called ${query.project} found`);
  }
  const response = issues.map((issue) => ({
    _id: issue._id,
    issue_title: issue.issue_title,
    issue_text: issue.issue_text,
    created_on: issue.createdAt,
    updated_on: issue.updatedAt,
    created_by: issue.created_by,
    assigned_to: issue.assigned_to,
    open: issue.open,
    status_text: issue.status_text
  }));
  
  return res.json(response);
};

const createIssue = async (req, res) => {
  req.body.project = req.params.project;
  const {
    body: { issue_title, issue_text, created_by }
  } = req;

  if (!issue_title || !issue_text || !created_by) {
    return res.json({ error: 'required field(s) missing' });
  }
  
  const created = await IssueModel.create(req.body);
  const response = {
    _id: created._id,
    issue_title: created.issue_title,
    issue_text: created.issue_text,
    created_on: created.createdAt,
    updated_on: created.updatedAt,
    created_by: created.created_by,
    assigned_to: created.assigned_to,
    open: created.open,
    status_text: created.status_text
  };

  return res.json(response);
}

const updateIssue = async (req, res) => {
  const dataUpdate = req.body;
  const {
    _id,
    issue_title,
    issue_text,
    created_by,
    assigned_to,
    open,
    status_text
  } = dataUpdate;
  
  try {
    if (!_id) {
      return res.json({ error: 'missing _id' });
    }

    if (!issue_title && !issue_text && !created_by && !assigned_to && !open && !status_text) {
      return res.json({ error: 'no update field(s) sent', _id });
    }

    const cleanBody = Object.keys(dataUpdate)
    .filter((k) => dataUpdate[k] !== "")
    .reduce((a, k) => ({ ...a, [k]: dataUpdate[k] }), {});
    
    const updated = await IssueModel.findByIdAndUpdate(
      { _id },
      { $set: cleanBody },
      { new: true, runValidators: true }
    );
    if (!updated) {
      throw 'could not update';
    }

    res.json({ result: 'successfully updated', _id });
  } catch (error) {
    // console.log(error);
    return res.json({ error: 'could not update', _id });
  }
}

const deleteIssue = async (req, res) => {
  const _id = req.body._id;

  if (!_id) {
    return res.json({ error: 'missing _id' });
  }

  const deleted = await IssueModel.findOneAndDelete({ _id });

  if (!deleted) {
    return res.json({ error: 'could not delete', _id });
  }

  return res.json({ result: 'successfully deleted', _id });
}

module.exports = {
  getIssues,
  createIssue,
  updateIssue,
  deleteIssue
}