// Validation middleware functions

// Validate login data
const validateLogin = (req, res, next) => {
    const { username, password } = req.body;

    const errors = [];

    if (!username || username.trim() === '') {
        errors.push('Username is required');
    }

    if (!password || password.trim() === '') {
        errors.push('Password is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

// Validate car data
const validateCar = (req, res, next) => {
    const { plate_number, driver_name, phone_number } = req.body;

    const errors = [];

    if (!plate_number || plate_number.trim() === '') {
        errors.push('Plate number is required');
    } else if (plate_number.length > 20) {
        errors.push('Plate number must be 20 characters or less');
    }

    if (!driver_name || driver_name.trim() === '') {
        errors.push('Driver name is required');
    } else if (driver_name.length > 100) {
        errors.push('Driver name must be 100 characters or less');
    }

    if (!phone_number || phone_number.trim() === '') {
        errors.push('Phone number is required');
    } else if (!/^\+?[0-9]{10,15}$/.test(phone_number.replace(/\s/g, ''))) {
        errors.push('Phone number must be 10-15 digits');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

// Validate car update data (no plate_number required in body)
const validateCarUpdate = (req, res, next) => {
    const { driver_name, phone_number } = req.body;

    const errors = [];

    if (!driver_name || driver_name.trim() === '') {
        errors.push('Driver name is required');
    } else if (driver_name.length > 100) {
        errors.push('Driver name must be 100 characters or less');
    }

    if (!phone_number || phone_number.trim() === '') {
        errors.push('Phone number is required');
    } else if (!/^\+?[0-9]{10,15}$/.test(phone_number.replace(/\s/g, ''))) {
        errors.push('Phone number must be 10-15 digits');
    }

    // car_model and car_color are optional, so no validation needed

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

// Validate parking slot data
const validateParkingSlot = (req, res, next) => {
    const { slot_number, slot_type, hourly_rate } = req.body;

    const errors = [];

    if (!slot_number || slot_number.trim() === '') {
        errors.push('Slot number is required');
    } else if (slot_number.length > 10) {
        errors.push('Slot number must be 10 characters or less');
    }

    if (slot_type && !['regular', 'vip', 'disabled'].includes(slot_type)) {
        errors.push('Slot type must be regular, vip, or disabled');
    }

    if (hourly_rate && (isNaN(hourly_rate) || hourly_rate < 0)) {
        errors.push('Hourly rate must be a positive number');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

// Validate parking entry data
const validateParkingEntry = (req, res, next) => {
    const { plate_number, slot_number } = req.body;

    const errors = [];

    if (!plate_number || plate_number.trim() === '') {
        errors.push('Plate number is required');
    }

    if (!slot_number || slot_number.trim() === '') {
        errors.push('Slot number is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

// Validate payment data
const validatePayment = (req, res, next) => {
    const { record_id, amount_paid, payment_method } = req.body;

    const errors = [];

    if (!record_id || isNaN(record_id)) {
        errors.push('Valid record ID is required');
    }

    if (!amount_paid || isNaN(amount_paid) || amount_paid <= 0) {
        errors.push('Amount paid must be a positive number');
    }

    if (payment_method && !['cash', 'card', 'mobile_money'].includes(payment_method)) {
        errors.push('Payment method must be cash, card, or mobile_money');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

// Validate registration data
const validateRegister = (req, res, next) => {
    const { username, password, fullName, role } = req.body;

    const errors = [];

    if (!username || username.trim() === '') {
        errors.push('Username is required');
    } else if (username.length < 3 || username.length > 50) {
        errors.push('Username must be 3-50 characters long');
    }

    if (!password || password.trim() === '') {
        errors.push('Password is required');
    } else if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    if (!fullName || fullName.trim() === '') {
        errors.push('Full name is required');
    } else if (fullName.length > 100) {
        errors.push('Full name must be 100 characters or less');
    }

    if (role && !['admin', 'manager'].includes(role)) {
        errors.push('Role must be admin or manager');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

// Validate user data
const validateUser = (req, res, next) => {
    const { username, password, full_name, role } = req.body;

    const errors = [];

    if (!username || username.trim() === '') {
        errors.push('Username is required');
    } else if (username.length < 3 || username.length > 50) {
        errors.push('Username must be 3-50 characters long');
    }

    if (!password || password.trim() === '') {
        errors.push('Password is required');
    } else if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    if (!full_name || full_name.trim() === '') {
        errors.push('Full name is required');
    } else if (full_name.length > 100) {
        errors.push('Full name must be 100 characters or less');
    }

    if (role && !['admin', 'manager'].includes(role)) {
        errors.push('Role must be admin or manager');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

// Validate date range
const validateDateRange = (req, res, next) => {
    const { date_from, date_to } = req.query;

    const errors = [];

    if (date_from && isNaN(Date.parse(date_from))) {
        errors.push('Invalid date_from format. Use YYYY-MM-DD');
    }

    if (date_to && isNaN(Date.parse(date_to))) {
        errors.push('Invalid date_to format. Use YYYY-MM-DD');
    }

    if (date_from && date_to && new Date(date_from) > new Date(date_to)) {
        errors.push('date_from cannot be later than date_to');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

module.exports = {
    validateLogin,
    validateRegister,
    validateCar,
    validateCarUpdate,
    validateParkingSlot,
    validateParkingEntry,
    validatePayment,
    validateUser,
    validateDateRange
};
