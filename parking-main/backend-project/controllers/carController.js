const Car = require('../models/Car');

class CarController {
    // Get all cars
    static async getAllCars(req, res) {
        try {
            const cars = await Car.getAll();
            
            res.json({
                success: true,
                message: 'Cars retrieved successfully',
                data: cars
            });
        } catch (error) {
            console.error('Get all cars error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get cars',
                error: error.message
            });
        }
    }

    // Get car by plate number
    static async getCarByPlate(req, res) {
        try {
            const { plate_number } = req.params;
            const car = await Car.findByPlateNumber(plate_number);
            
            if (!car) {
                return res.status(404).json({
                    success: false,
                    message: 'Car not found'
                });
            }
            
            res.json({
                success: true,
                message: 'Car retrieved successfully',
                data: car
            });
        } catch (error) {
            console.error('Get car by plate error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get car',
                error: error.message
            });
        }
    }

    // Create new car
    static async createCar(req, res) {
        try {
            const { plate_number, driver_name, phone_number, car_model, car_color } = req.body;
            
            const car = await Car.create({
                plate_number,
                driver_name,
                phone_number,
                car_model,
                car_color
            });
            
            res.status(201).json({
                success: true,
                message: 'Car created successfully',
                data: car
            });
        } catch (error) {
            console.error('Create car error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create car',
                error: error.message
            });
        }
    }

    // Update car
    static async updateCar(req, res) {
        try {
            const { plate_number } = req.params;
            const { driver_name, phone_number, car_model, car_color } = req.body;
            
            const car = await Car.findByPlateNumber(plate_number);
            
            if (!car) {
                return res.status(404).json({
                    success: false,
                    message: 'Car not found'
                });
            }
            
            const updatedCar = await car.update({
                driver_name,
                phone_number,
                car_model,
                car_color
            });
            
            res.json({
                success: true,
                message: 'Car updated successfully',
                data: updatedCar
            });
        } catch (error) {
            console.error('Update car error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update car',
                error: error.message
            });
        }
    }

    // Delete car
    static async deleteCar(req, res) {
        try {
            const { plate_number } = req.params;
            
            const car = await Car.findByPlateNumber(plate_number);
            
            if (!car) {
                return res.status(404).json({
                    success: false,
                    message: 'Car not found'
                });
            }
            
            await car.delete();
            
            res.json({
                success: true,
                message: 'Car deleted successfully'
            });
        } catch (error) {
            console.error('Delete car error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete car',
                error: error.message
            });
        }
    }

    // Search cars
    static async searchCars(req, res) {
        try {
            const { plate_number, driver_name, phone_number } = req.query;
            
            const cars = await Car.search({
                plate_number,
                driver_name,
                phone_number
            });
            
            res.json({
                success: true,
                message: 'Search results retrieved successfully',
                data: cars
            });
        } catch (error) {
            console.error('Search cars error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to search cars',
                error: error.message
            });
        }
    }

    // Get car parking history
    static async getCarHistory(req, res) {
        try {
            const { plate_number } = req.params;
            
            const car = await Car.findByPlateNumber(plate_number);
            
            if (!car) {
                return res.status(404).json({
                    success: false,
                    message: 'Car not found'
                });
            }
            
            const history = await car.getParkingHistory();
            
            res.json({
                success: true,
                message: 'Car parking history retrieved successfully',
                data: {
                    car: car,
                    history: history
                }
            });
        } catch (error) {
            console.error('Get car history error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get car history',
                error: error.message
            });
        }
    }

    // Check if car is currently parked
    static async checkParkingStatus(req, res) {
        try {
            const { plate_number } = req.params;
            
            const car = await Car.findByPlateNumber(plate_number);
            
            if (!car) {
                return res.status(404).json({
                    success: false,
                    message: 'Car not found'
                });
            }
            
            const currentParking = await car.isCurrentlyParked();
            
            res.json({
                success: true,
                message: 'Parking status retrieved successfully',
                data: {
                    car: car,
                    is_parked: !!currentParking,
                    current_parking: currentParking
                }
            });
        } catch (error) {
            console.error('Check parking status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to check parking status',
                error: error.message
            });
        }
    }

    // Get cars by driver name
    static async getCarsByDriver(req, res) {
        try {
            const { driver_name } = req.params;
            
            const cars = await Car.findByDriverName(driver_name);
            
            res.json({
                success: true,
                message: 'Cars retrieved successfully',
                data: cars
            });
        } catch (error) {
            console.error('Get cars by driver error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get cars by driver',
                error: error.message
            });
        }
    }

    // Get cars by phone number
    static async getCarsByPhone(req, res) {
        try {
            const { phone_number } = req.params;
            
            const cars = await Car.findByPhoneNumber(phone_number);
            
            res.json({
                success: true,
                message: 'Cars retrieved successfully',
                data: cars
            });
        } catch (error) {
            console.error('Get cars by phone error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get cars by phone',
                error: error.message
            });
        }
    }
}

module.exports = CarController;
