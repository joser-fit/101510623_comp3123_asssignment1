const express = require('express');
const { body, validationResult } = require('express-validator');
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

const employeeValidation = [
  ...['first_name', 'last_name', 'position', 'department'].map(field =>
    body(field)
      .isString()
      .withMessage(`${field} must be text`)
      .bail()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage(`${field} must contain 1–100 characters`)
  ),

  body('email')
    .isString()
    .bail()
    .trim()
    .isEmail()
    .withMessage('Enter a valid email address')
    .bail()
    .toLowerCase(),

  body('salary')
    .isFloat({ min: 0 })
    .withMessage('Salary must be a non-negative number')
    .bail()
    .toFloat(),

  body('date_of_joining')
    .isISO8601({ strict: true })
    .withMessage('Enter a valid date, such as 2026-10-20')
    .bail()
    .toDate()
];

// Create an employee
router.post('/', employeeValidation, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }

  try {
    const {
      first_name,
      last_name,
      email,
      position,
      salary,
      department,
      date_of_joining
    } = req.body;

    const employee = await Employee.create({
      first_name,
      last_name,
      email,
      position,
      salary,
      department,
      date_of_joining,
      user: req.userId
    });

    return res.status(201).json({
      message: 'Employee created successfully',
      employee
    });
  } catch (error) {
    console.error('Employee creation failed:', error.message);

    return res.status(500).json({
      message: 'Unable to create employee'
    });
  }
});

// List only the logged-in user's employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find({ user: req.userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: employees.length,
      employees
    });
  } catch (error) {
    console.error('Employee listing failed:', error.message);

    return res.status(500).json({
      message: 'Unable to retrieve employees'
    });
  }
});

// View one employee belonging to the logged-in user
router.get('/:id', async (req, res) => {
  if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) {
    return res.status(400).json({
      message: 'Invalid employee ID'
    });
  }

  try {
    const employee = await Employee.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    return res.status(200).json({ employee });
  } catch (error) {
    console.error('Employee lookup failed:', error.message);

    return res.status(500).json({
      message: 'Unable to retrieve employee'
    });
  }
});

// Update an employee belonging to the logged-in user
router.put('/:id', employeeValidation, async (req, res) => {
  console.log('Request URL:', JSON.stringify(req.originalUrl));
  console.log('Route parameters:', req.params);
  if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) {
    return res.status(400).json({
      message: 'Invalid employee ID'
    });
  }

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }

  try {
    const {
      first_name,
      last_name,
      email,
      position,
      salary,
      department,
      date_of_joining
    } = req.body;

    const employee = await Employee.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId
      },
      {
        $set: {
          first_name,
          last_name,
          email,
          position,
          salary,
          department,
          date_of_joining
        }
      },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    return res.status(200).json({
      message: 'Employee updated successfully',
      employee
    });
  } catch (error) {
    console.error('Employee update failed:', error.message);

    return res.status(500).json({
      message: 'Unable to update employee'
    });
  }
});

// Delete an employee belonging to the logged-in user
router.delete('/', async (req, res) => {
  const { eid } = req.query;

  if (typeof eid !== 'string' || !/^[a-fA-F0-9]{24}$/.test(eid)) {
    return res.status(400).json({
      message: 'A valid employee ID is required in the eid query parameter'
    });
  }

  try {
    const employee = await Employee.findOneAndDelete({
      _id: eid,
      user: req.userId
    });

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    return res.status(200).json({
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Employee deletion failed:', error.message);

    return res.status(500).json({
      message: 'Unable to delete employee'
    });
  }
});

module.exports = router;