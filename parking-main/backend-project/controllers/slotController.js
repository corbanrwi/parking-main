const ParkingSlot = require('../models/ParkingSlot');

class SlotController {
    // Get all parking slots
    static async getAllSlots(req, res) {
        try {
            const slots = await ParkingSlot.getAll();
            
            res.json({
                success: true,
                message: 'Parking slots retrieved successfully',
                data: slots
            });
        } catch (error) {
            console.error('Get all slots error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get parking slots',
                error: error.message
            });
        }
    }

    // Get available slots
    static async getAvailableSlots(req, res) {
        try {
            const slots = await ParkingSlot.getAvailable();
            
            res.json({
                success: true,
                message: 'Available parking slots retrieved successfully',
                data: slots
            });
        } catch (error) {
            console.error('Get available slots error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get available parking slots',
                error: error.message
            });
        }
    }

    // Get slots by type
    static async getSlotsByType(req, res) {
        try {
            const { type } = req.params;
            
            if (!['regular', 'vip', 'disabled'].includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid slot type. Must be regular, vip, or disabled'
                });
            }
            
            const slots = await ParkingSlot.getByType(type);
            
            res.json({
                success: true,
                message: `${type} parking slots retrieved successfully`,
                data: slots
            });
        } catch (error) {
            console.error('Get slots by type error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get parking slots by type',
                error: error.message
            });
        }
    }

    // Get slot by number
    static async getSlotByNumber(req, res) {
        try {
            const { slot_number } = req.params;
            const slot = await ParkingSlot.findByNumber(slot_number);
            
            if (!slot) {
                return res.status(404).json({
                    success: false,
                    message: 'Parking slot not found'
                });
            }
            
            res.json({
                success: true,
                message: 'Parking slot retrieved successfully',
                data: slot
            });
        } catch (error) {
            console.error('Get slot by number error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get parking slot',
                error: error.message
            });
        }
    }

    // Create new parking slot
    static async createSlot(req, res) {
        try {
            const { slot_number, slot_type, hourly_rate } = req.body;
            
            const slot = await ParkingSlot.create({
                slot_number,
                slot_type,
                hourly_rate
            });
            
            res.status(201).json({
                success: true,
                message: 'Parking slot created successfully',
                data: slot
            });
        } catch (error) {
            console.error('Create slot error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create parking slot',
                error: error.message
            });
        }
    }

    // Update slot status
    static async updateSlotStatus(req, res) {
        try {
            const { slot_number } = req.params;
            const { status } = req.body;
            
            if (!['available', 'occupied', 'maintenance'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be available, occupied, or maintenance'
                });
            }
            
            const slot = await ParkingSlot.updateStatus(slot_number, status);
            
            res.json({
                success: true,
                message: 'Slot status updated successfully',
                data: slot
            });
        } catch (error) {
            console.error('Update slot status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update slot status',
                error: error.message
            });
        }
    }

    // Update slot details
    static async updateSlot(req, res) {
        try {
            const { slot_number } = req.params;
            const { slot_type, hourly_rate } = req.body;
            
            const slot = await ParkingSlot.findByNumber(slot_number);
            
            if (!slot) {
                return res.status(404).json({
                    success: false,
                    message: 'Parking slot not found'
                });
            }
            
            const updatedSlot = await slot.update({
                slot_type,
                hourly_rate
            });
            
            res.json({
                success: true,
                message: 'Parking slot updated successfully',
                data: updatedSlot
            });
        } catch (error) {
            console.error('Update slot error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update parking slot',
                error: error.message
            });
        }
    }

    // Delete parking slot
    static async deleteSlot(req, res) {
        try {
            const { slot_number } = req.params;
            
            const slot = await ParkingSlot.findByNumber(slot_number);
            
            if (!slot) {
                return res.status(404).json({
                    success: false,
                    message: 'Parking slot not found'
                });
            }
            
            await slot.delete();
            
            res.json({
                success: true,
                message: 'Parking slot deleted successfully'
            });
        } catch (error) {
            console.error('Delete slot error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete parking slot',
                error: error.message
            });
        }
    }

    // Get slot statistics
    static async getSlotStatistics(req, res) {
        try {
            const stats = await ParkingSlot.getStatistics();
            
            res.json({
                success: true,
                message: 'Slot statistics retrieved successfully',
                data: stats
            });
        } catch (error) {
            console.error('Get slot statistics error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get slot statistics',
                error: error.message
            });
        }
    }

    // Get slot occupancy map
    static async getSlotMap(req, res) {
        try {
            const slots = await ParkingSlot.getAll();
            
            // Group slots by section (first letter of slot number)
            const slotMap = {};
            
            slots.forEach(slot => {
                const section = slot.slot_number.charAt(0);
                if (!slotMap[section]) {
                    slotMap[section] = [];
                }
                slotMap[section].push(slot);
            });
            
            // Sort slots within each section
            Object.keys(slotMap).forEach(section => {
                slotMap[section].sort((a, b) => {
                    const numA = parseInt(a.slot_number.substring(1));
                    const numB = parseInt(b.slot_number.substring(1));
                    return numA - numB;
                });
            });
            
            res.json({
                success: true,
                message: 'Slot map retrieved successfully',
                data: {
                    sections: slotMap,
                    total_slots: slots.length,
                    available_count: slots.filter(s => s.slot_status === 'available').length,
                    occupied_count: slots.filter(s => s.slot_status === 'occupied').length,
                    maintenance_count: slots.filter(s => s.slot_status === 'maintenance').length
                }
            });
        } catch (error) {
            console.error('Get slot map error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get slot map',
                error: error.message
            });
        }
    }
}

module.exports = SlotController;
