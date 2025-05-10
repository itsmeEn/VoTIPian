const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const discussionController = require('../controllers/discussion.controller');
const auth = require('../middleware/auth');

// @route   GET api/discussions
// @desc    Get all discussions
// @access  Public
router.get('/', discussionController.getAllDiscussions);

// @route   GET api/discussions/:id
// @desc    Get discussion by ID
// @access  Public
router.get('/:id', discussionController.getDiscussionById);

// @route   POST api/discussions
// @desc    Create a new discussion
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('content', 'Content is required').not().isEmpty(),
      check('category', 'Category must be valid').isIn(['General', 'Election', 'Candidate'])
    ]
  ],
  discussionController.createDiscussion
);

// @route   PUT api/discussions/:id
// @desc    Update a discussion
// @access  Private
router.put('/:id', auth, discussionController.updateDiscussion);

// @route   DELETE api/discussions/:id
// @desc    Delete a discussion
// @access  Private
router.delete('/:id', auth, discussionController.deleteDiscussion);

// @route   POST api/discussions/:id/comments
// @desc    Add a comment to a discussion
// @access  Private
router.post(
  '/:id/comments',
  [
    auth,
    [
      check('content', 'Content is required').not().isEmpty()
    ]
  ],
  discussionController.addComment
);

// @route   DELETE api/discussions/:id/comments/:commentId
// @desc    Delete a comment
// @access  Private
router.delete('/:id/comments/:commentId', auth, discussionController.deleteComment);

// @route   PUT api/discussions/:id/comments/:commentId/like
// @desc    Like or unlike a comment
// @access  Private
router.put('/:id/comments/:commentId/like', auth, discussionController.toggleLikeComment);

module.exports = router;