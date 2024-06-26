const express = require('express');
const axios = require('axios');
const router = express.Router();

const TASK_API_URL = `${process.env.TASK_API_URL}/tasks`;
const API_KEY = process.env.TASK_API_KEY;

const config = {
    headers: {
      'x-api-key': API_KEY,
    },
  };

router.get('/:userId', async (req, res) => {
  const response = await axios.get(`${TASK_API_URL}/${req.params.userId}`, config);
  res.json(response.data);
});

router.post('/:userId', async (req, res) => {
  const response = await axios.post(`${TASK_API_URL}/${req.params.userId}`, req.body, config);
  res.json(response.data);
});

router.get('/update/:taskId', async (req, res) => {
  await axios.get(`${TASK_API_URL}/update/${req.params.taskId}`, config);
  res.sendStatus(204);
});

router.delete('/:taskId', async (req, res) => {
  await axios.delete(`${TASK_API_URL}/${req.params.taskId}`, config);
  res.sendStatus(204);
});

module.exports = router;
