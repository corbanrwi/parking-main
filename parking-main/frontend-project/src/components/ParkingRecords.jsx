import { useState, useEffect } from 'react';
import { apiClient } from '../config/api';
import { formatMoneyCompact, formatMoneyDetailed } from '../utils/formatters';

const ParkingRecords = () => {
  const [registeredCars, setRegisteredCars] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCar, setSelectedCar] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  // Edit functionality
  const [editingRecord, setEditingRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({
    plateNumber: '',
    slotNumber: '',
    entryTime: '',
    exitTime: '',
    notes: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching parking records data...');

      const [carsResponse, slotsResponse, recordsResponse] = await Promise.all([
        apiClient.get('/cars'),
        apiClient.get('/slots'),
        apiClient.get('/parking/records')
      ]);

      console.log('Cars response:', carsResponse.data);
      console.log('Slots response:', slotsResponse.data);
      console.log('Records response:', recordsResponse.data);

      setRegisteredCars(carsResponse.data.data || []);
      setAvailableSlots(slotsResponse.data.data?.filter(slot => slot.slot_status === 'available') || []);
      setRecords(recordsResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setRegisteredCars([]);
      setAvailableSlots([]);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();

    const car = registeredCars.find(c => c.plate_number === selectedCar);
    const slot = availableSlots.find(s => s.slot_number === selectedSlot);

    if (!car || !slot) {
      alert('Please select both a car and an available slot');
      return;
    }

    try {
      // Use the parking controller's carEntry endpoint
      const recordData = {
        plate_number: car.plate_number,
        slot_number: slot.slot_number
      };

      console.log('Creating parking record:', recordData);

      const response = await apiClient.post('/parking/entry', recordData);
      if (response.data.success) {
        await fetchData(); // Refresh all data
        setSelectedCar('');
        setSelectedSlot('');
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding parking record:', error);
      const errorMessage = error.response?.data?.message || 'Error adding parking record. Please try again.';
      alert(errorMessage);
    }
  };

  const handleExitCar = async (id) => {
    try {
      const response = await apiClient.put(`/parking/exit/${id}`);
      if (response.data.success) {
        await fetchData(); // Refresh all data
      }
    } catch (error) {
      console.error('Error processing car exit:', error);
      alert('Error processing car exit. Please try again.');
    }
  };

  const handleDeleteRecord = async (id) => {
    if (window.confirm('Are you sure you want to delete this parking record?')) {
      try {
        await apiClient.delete(`/parking/records/${id}`);
        await fetchData(); // Refresh all data
      } catch (error) {
        console.error('Error deleting parking record:', error);
        alert('Error deleting parking record. Please try again.');
      }
    }
  };

  const handleEditRecord = (record) => {
    setEditingRecord(record.record_id);
    setEditFormData({
      plateNumber: record.plate_number,
      slotNumber: record.slot_number,
      entryTime: new Date(record.entry_time).toISOString().slice(0, 16),
      exitTime: record.exit_time ? new Date(record.exit_time).toISOString().slice(0, 16) : '',
      notes: record.notes || ''
    });
    setShowAddForm(false); // Close add form when editing
    setError('');
  };

  const handleUpdateRecord = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const updateData = {
        plate_number: editFormData.plateNumber,
        slot_number: editFormData.slotNumber,
        entry_time: editFormData.entryTime,
        exit_time: editFormData.exitTime || null,
        notes: editFormData.notes || null
      };

      console.log('Updating record:', editingRecord);
      console.log('Update data:', updateData);

      const response = await apiClient.put(`/parking/records/${editingRecord}`, updateData);
      if (response.data.success) {
        await fetchData(); // Refresh the list
        setEditingRecord(null);
        setEditFormData({
          plateNumber: '',
          slotNumber: '',
          entryTime: '',
          exitTime: '',
          notes: ''
        });
        setError('');
      }
    } catch (error) {
      console.error('Error updating record:', error);
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.errors?.join(', ') ||
                          'Error updating record. Please try again.';
      setError(errorMessage);
    }
  };

  const handleCancelEdit = () => {
    setEditingRecord(null);
    setEditFormData({
      plateNumber: '',
      slotNumber: '',
      entryTime: '',
      exitTime: '',
      notes: ''
    });
    setError('');
  };

  const getStatusColor = (status) => {
    return status === 'Active'
      ? 'bg-orange-500/20 text-orange-400'
      : 'bg-green-500/20 text-green-400';
  };

  const activeRecords = records.filter(record =>
    record.status && (record.status.toLowerCase() === 'active' || record.status === 'Active')
  ).length;
  const completedRecords = records.filter(record =>
    record.status && (record.status.toLowerCase() === 'completed' || record.status === 'Completed')
  ).length;
  const totalRevenue = records.reduce((sum, record) => {
    const amount = record.total_amount || record.amount || 0;
    return sum + Number(amount);
  }, 0);

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Parking Records</h1>
        <p className="text-slate-400">Track all parking entries, exits, and calculate fees automatically</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700/50">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Total Records</h3>
          <p className="text-2xl font-bold text-white">{records.length}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700/50">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Active Parking</h3>
          <p className="text-2xl font-bold text-white">{activeRecords}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700/50">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Completed</h3>
          <p className="text-2xl font-bold text-white">{completedRecords}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700/50">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Total Revenue</h3>
          <p className="text-2xl font-bold text-white">{formatMoneyCompact(totalRevenue)} RWF</p>
        </div>
      </div>

      {/* Add Record Button */}
      <div className="mb-6">
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingRecord(null); // Close edit form when adding
            setError('');
          }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-orange-500/25"
        >
          {showAddForm ? 'Cancel' : 'Record Car Entry'}
        </button>
      </div>

      {/* Add Record Form */}
      {showAddForm && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50 shadow-lg mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Record New Car Entry</h2>
          <form onSubmit={handleAddRecord} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Select Registered Car</label>
              <select
                value={selectedCar}
                onChange={(e) => setSelectedCar(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all duration-200"
                required
              >
                <option value="">Choose a car...</option>
                {registeredCars.map((car) => (
                  <option key={car.plate_number} value={car.plate_number}>
                    {car.plate_number} - {car.driver_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Select Available Slot</label>
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all duration-200"
                required
              >
                <option value="">Choose a slot...</option>
                {availableSlots.map((slot) => (
                  <option key={slot.slot_number} value={slot.slot_number}>
                    {slot.slot_number} - {slot.slot_type} ({slot.hourly_rate} RWF/hr)
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200"
              >
                Record Entry
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Record Form */}
      {editingRecord && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50 shadow-lg mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Edit Parking Record</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleUpdateRecord} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Plate Number</label>
              <input
                type="text"
                value={editFormData.plateNumber}
                onChange={(e) => setEditFormData({...editFormData, plateNumber: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Slot Number</label>
              <input
                type="text"
                value={editFormData.slotNumber}
                onChange={(e) => setEditFormData({...editFormData, slotNumber: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Entry Time</label>
              <input
                type="datetime-local"
                value={editFormData.entryTime}
                onChange={(e) => setEditFormData({...editFormData, entryTime: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Exit Time (Optional)</label>
              <input
                type="datetime-local"
                value={editFormData.exitTime}
                onChange={(e) => setEditFormData({...editFormData, exitTime: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Notes (Optional)</label>
              <input
                type="text"
                value={editFormData.notes}
                onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all duration-200"
                placeholder="Additional notes..."
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex space-x-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200"
              >
                Update Record
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Records Table */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 lg:p-6 border border-slate-700/50 shadow-lg">
        <h2 className="text-lg lg:text-xl font-bold text-white mb-4">All Parking Records</h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-3 text-slate-400">Loading parking records...</span>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg mb-2">No parking records found</p>
            <p className="text-slate-500">Record your first car entry to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Plate Number</th>
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Driver</th>
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Slot</th>
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Entry Time</th>
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Exit Time</th>
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Duration</th>
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Amount</th>
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Status</th>
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                <tr key={record.record_id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                  <td className="py-4 text-white font-medium text-sm lg:text-base">{record.plate_number}</td>
                  <td className="py-4 text-slate-300 text-sm lg:text-base">{record.driver_name || 'N/A'}</td>
                  <td className="py-4 text-slate-300 text-sm lg:text-base">{record.slot_number}</td>
                  <td className="py-4 text-slate-300 text-sm lg:text-base">
                    {new Date(record.entry_time).toLocaleString()}
                  </td>
                  <td className="py-4 text-slate-300 text-sm lg:text-base">
                    {record.exit_time ? new Date(record.exit_time).toLocaleString() : 'Still Parked'}
                  </td>
                  <td className="py-4 text-slate-300 text-sm lg:text-base">
                    {record.duration_minutes ? `${record.duration_minutes} min` : 'Ongoing'}
                  </td>
                  <td className="py-4 text-white font-medium text-sm lg:text-base">
                    {record.total_amount > 0 ? formatMoneyDetailed(record.total_amount) : '-'}
                  </td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditRecord(record)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Edit
                      </button>
                      {record.status === 'Active' && (
                        <button
                          onClick={() => handleExitCar(record.record_id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Exit Car
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteRecord(record.record_id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParkingRecords;
