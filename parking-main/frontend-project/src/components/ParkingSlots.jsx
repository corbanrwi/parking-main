import { useState, useEffect } from 'react';
import { apiClient } from '../config/api';
import { formatMoneyDetailed } from '../utils/formatters';

const ParkingSlots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newSlot, setNewSlot] = useState({
    slotNumber: '',
    slotType: 'regular',
    hourlyRate: 1000,
    slotStatus: 'available'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      console.log('Fetching parking slots...');
      const response = await apiClient.get('/slots');
      console.log('Slots response:', response.data);
      setSlots(response.data.data || []);
    } catch (error) {
      console.error('Error fetching parking slots:', error);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Map frontend field names to backend field names
      const slotData = {
        slot_number: newSlot.slotNumber.trim(),
        slot_type: newSlot.slotType,
        hourly_rate: parseFloat(newSlot.hourlyRate),
        slot_status: newSlot.slotStatus
      };

      console.log('Sending slot data:', slotData);

      const response = await apiClient.post('/slots', slotData);
      if (response.data.success) {
        await fetchSlots(); // Refresh the list
        setNewSlot({
          slotNumber: '',
          slotType: 'regular',
          hourlyRate: 1000,
          slotStatus: 'available'
        });
        setShowAddForm(false);
        setError('');
      }
    } catch (error) {
      console.error('Error adding parking slot:', error);
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.errors?.join(', ') ||
                          'Error adding parking slot. Please try again.';
      setError(errorMessage);
    }
  };



  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 text-green-400';
      case 'occupied':
        return 'bg-red-500/20 text-red-400';
      case 'maintenance':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };



  const availableSlots = slots.filter(slot => slot.slot_status === 'available').length;
  const occupiedSlots = slots.filter(slot => slot.slot_status === 'occupied').length;
  const maintenanceSlots = slots.filter(slot => slot.slot_status === 'maintenance').length;

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Parking Slots Management</h1>
        <p className="text-slate-400">Monitor and manage all parking slots in real-time</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700/50">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Total Slots</h3>
          <p className="text-2xl font-bold text-white">{slots.length}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700/50">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Available</h3>
          <p className="text-2xl font-bold text-white">{availableSlots}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700/50">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Occupied</h3>
          <p className="text-2xl font-bold text-white">{occupiedSlots}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700/50">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Maintenance</h3>
          <p className="text-2xl font-bold text-white">{maintenanceSlots}</p>
        </div>
      </div>

      {/* Add Slot Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-orange-500/25"
        >
          {showAddForm ? 'Cancel' : 'Add New Slot'}
        </button>
      </div>

      {/* Add Slot Form */}
      {showAddForm && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50 shadow-lg mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Add New Parking Slot</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleAddSlot} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Slot Number</label>
              <input
                type="text"
                value={newSlot.slotNumber}
                onChange={(e) => setNewSlot({...newSlot, slotNumber: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all duration-200"
                placeholder="e.g., A001, B002"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Slot Type</label>
              <select
                value={newSlot.slotType}
                onChange={(e) => setNewSlot({...newSlot, slotType: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all duration-200"
              >
                <option value="regular">Regular</option>
                <option value="vip">VIP</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Hourly Rate (RWF)</label>
              <input
                type="number"
                value={newSlot.hourlyRate}
                onChange={(e) => setNewSlot({...newSlot, hourlyRate: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all duration-200"
                placeholder="1000"
                min="0"
                step="100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Initial Status</label>
              <select
                value={newSlot.slotStatus}
                onChange={(e) => setNewSlot({...newSlot, slotStatus: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all duration-200"
              >
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200"
              >
                Add Slot
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Slots Table */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 lg:p-6 border border-slate-700/50 shadow-lg">
        <h2 className="text-lg lg:text-xl font-bold text-white mb-4">Parking Slots Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Slot Number</th>
                <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Type</th>
                <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Rate</th>
                <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Status</th>
                <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Current Car</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.slot_number} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                  <td className="py-4 text-white font-medium text-sm lg:text-base">
                    {slot.slot_number}
                  </td>
                  <td className="py-4 text-slate-300 text-sm lg:text-base capitalize">
                    {slot.slot_type}
                  </td>
                  <td className="py-4 text-slate-300 text-sm lg:text-base">
                    {formatMoneyDetailed(slot.hourly_rate).replace(' RWF', '')} RWF/hr
                  </td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(slot.slot_status)}`}>
                      {slot.slot_status}
                    </span>
                  </td>
                  <td className="py-4 text-slate-300 text-sm lg:text-base">
                    {slot.current_car || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ParkingSlots;
