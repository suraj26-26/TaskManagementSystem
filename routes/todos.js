const express = require('express');
const Todo = require('../models/todo');

const router = express.Router();

function loggedIn(req, res, next) {
    if(!req.session.userId) {
        return res.status(401).send('Login Required');
    }
    next();
}

router.get('/', loggedIn, async (req, res) => {
    try {
        const todos = await Todo.find({ owner: req.session.userId});
        res.json(todos);
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

router.post('/', loggedIn, async (req, res) => {
    
    const { description } = req.body;
    if(!description || description.trim() === ''){
        return res.status(400).json({ error: 'Description is required' });
    }
    try{
        const todo = new Todo({
        description,
        owner: req.session.userId
    });
    await todo.save();
    res.status(201).json(todo);
 } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
 }
});


router.post('/toggle/:id', loggedIn, async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if(!todo) {
            return res.status(404).send('Todo not found.');
        }
        todo.completed = !todo.completed;
        await todo.save();
        res.json(todo);
    } catch (error) {
        res.status(500).send('Error Toggling Todo');
    }
});

router.delete('/:id', loggedIn, async(req, res) => {
    try {
        const result = await Todo.findByIdAndDelete(req.params.id);
        if(!result) {
            return res.status(404).send('Todo not found.');
        }
        res.status(200).send({ message: 'Deleted Successfully' });
    } catch (error) {
        res.status(500).send('Error in deleting Todo');
    }
});

module.exports = router;