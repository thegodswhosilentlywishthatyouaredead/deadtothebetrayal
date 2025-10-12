const express = require('express');
const router = express.Router();
const llmService = require('../services/llmService');

/**
 * POST /api/ai/query
 * Process AI assistant query for admin dashboard
 */
router.post('/query', async (req, res) => {
  try {
    const { query, context, chatHistory } = req.body;

    if (!query || !context) {
      return res.status(400).json({
        error: 'Query and context are required'
      });
    }

    // Process the query using LLM service
    const result = await llmService.processAdminQuery(query, context, chatHistory);

    res.json(result);

  } catch (error) {
    console.error('Error processing AI query:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/team-query
 * Process AI assistant query for field team members
 */
router.post('/team-query', async (req, res) => {
  try {
    const { query, teamMemberId, context } = req.body;

    if (!query || !teamMemberId) {
      return res.status(400).json({
        error: 'Query and teamMemberId are required'
      });
    }

    // Process the query using LLM service
    const result = await llmService.processQuery(query, teamMemberId, context);

    res.json(result);

  } catch (error) {
    console.error('Error processing team AI query:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/ai/performance-insights/:teamMemberId
 * Generate performance insights for a team member
 */
router.get('/performance-insights/:teamMemberId', async (req, res) => {
  try {
    const { teamMemberId } = req.params;

    const insights = await llmService.generatePerformanceInsights(teamMemberId);

    res.json(insights);

  } catch (error) {
    console.error('Error generating performance insights:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/ai/troubleshooting/:ticketId
 * Generate troubleshooting suggestions for a ticket
 */
router.get('/troubleshooting/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;

    const suggestions = await llmService.generateTroubleshootingSuggestions(ticketId);

    res.json(suggestions);

  } catch (error) {
    console.error('Error generating troubleshooting suggestions:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
