const express = require('express');
const FormsController = require('../controllers/formsController');

const router = express.Router();
const controller = new FormsController();

router.get('/', controller.list.bind(controller));
router.get('/metadata/categories', controller.categories.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.post('/', controller.create.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.remove.bind(controller));

module.exports = router;
