const Discussion = require('../models/Discussion');
const { validationResult } = require('express-validator');

// @route   GET api/discussions
// @desc    Get all discussions
// @access  Public
exports.getAllDiscussions = async (req, res) => {
  try {
    const filter = {};
    
    // Filter by category if provided
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Filter by related entity if provided
    if (req.query.relatedTo) {
      filter.relatedTo = req.query.relatedTo;
    }
    
    const discussions = await Discussion.find(filter)
      .populate({ path: 'author', select: 'firstName lastName' })
      .sort({ createdAt: -1 });
    
    res.json(discussions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET api/discussions/:id
// @desc    Get discussion by ID
// @access  Public
exports.getDiscussionById = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate({ path: 'author', select: 'firstName lastName' })
      .populate({ path: 'comments.user', select: 'firstName lastName' });
    
    if (!discussion) {
      return res.status(404).json({ msg: 'Discussion not found' });
    }
    
    res.json(discussion);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Discussion not found' });
    }
    res.status(500).send('Server error');
  }
};

// @route   POST api/discussions
// @desc    Create a new discussion
// @access  Private
exports.createDiscussion = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, content, category, relatedTo, onModel } = req.body;

  try {
    const newDiscussion = new Discussion({
      title,
      content,
      author: req.user.id,
      category,
      relatedTo,
      onModel
    });

    const discussion = await newDiscussion.save();
    
    // Populate author info before returning
    const populatedDiscussion = await discussion.populate({ path: 'author', select: 'firstName lastName' });
    
    res.json(populatedDiscussion);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   PUT api/discussions/:id
// @desc    Update a discussion
// @access  Private
exports.updateDiscussion = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ msg: 'Discussion not found' });
    }
    
    // Check if user is the author or an admin
    if (discussion.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to update this discussion' });
    }
    
    // Update fields
    const { title, content } = req.body;
    
    discussion = await Discussion.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          title: title || discussion.title,
          content: content || discussion.content
        } 
      },
      { new: true }
    ).populate({ path: 'author', select: 'firstName lastName' });

    res.json(discussion);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Discussion not found' });
    }
    res.status(500).send('Server error');
  }
};

// @route   DELETE api/discussions/:id
// @desc    Delete a discussion
// @access  Private
exports.deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ msg: 'Discussion not found' });
    }
    
    // Check if user is the author or an admin
    if (discussion.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to delete this discussion' });
    }
    
    await discussion.deleteOne();
    
    res.json({ msg: 'Discussion removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Discussion not found' });
    }
    res.status(500).send('Server error');
  }
};

// @route   POST api/discussions/:id/comments
// @desc    Add a comment to a discussion
// @access  Private
exports.addComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ msg: 'Discussion not found' });
    }
    
    const newComment = {
      user: req.user.id,
      content: req.body.content
    };
    
    discussion.comments.unshift(newComment);
    
    await discussion.save();
    
    // Populate user info for the new comment
    const populatedDiscussion = await discussion.populate({ path: 'comments.user', select: 'firstName lastName' });
    
    res.json(populatedDiscussion.comments);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Discussion not found' });
    }
    res.status(500).send('Server error');
  }
};

// @route   DELETE api/discussions/:id/comments/:commentId
// @desc    Delete a comment
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ msg: 'Discussion not found' });
    }
    
    // Find the comment
    const comment = discussion.comments.find(
      comment => comment._id.toString() === req.params.commentId
    );
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    
    // Check if user is the comment author or an admin
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to delete this comment' });
    }
    
    // Remove the comment
    discussion.comments = discussion.comments.filter(
      comment => comment._id.toString() !== req.params.commentId
    );
    
    await discussion.save();
    
    res.json(discussion.comments);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resource not found' });
    }
    res.status(500).send('Server error');
  }
};

// @route   PUT api/discussions/:id/comments/:commentId/like
// @desc    Like or unlike a comment
// @access  Private
exports.toggleLikeComment = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ msg: 'Discussion not found' });
    }
    
    // Find the comment
    const comment = discussion.comments.find(
      comment => comment._id.toString() === req.params.commentId
    );
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    
    // Check if the comment has already been liked by this user
    const likeIndex = comment.likes.findIndex(
      like => like.toString() === req.user.id
    );
    
    if (likeIndex === -1) {
      // Not liked yet, so add like
      comment.likes.push(req.user.id);
    } else {
      // Already liked, so remove like
      comment.likes.splice(likeIndex, 1);
    }
    
    await discussion.save();
    
    res.json(comment.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resource not found' });
    }
    res.status(500).send('Server error');
  }
};