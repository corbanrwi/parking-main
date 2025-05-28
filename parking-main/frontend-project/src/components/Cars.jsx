import { useState, useEffect } from 'react';
import { apiClient } from '../config/api';

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCar, setNewCar] = useState({
    plateNumber: '',
    driverName: '',
    phoneNumber: '',
    carModel: '',
    carColor: ''
  });
  const [error, setError] = useState('');


  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/cars');
      setCars(response.data.data || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Map frontend field names to backend field names
      const carData = {
        plate_number: newCar.plateNumber.trim(),
        driver_name: newCar.driverName.trim(),
        phone_number: newCar.phoneNumber.trim(),
        car_model: newCar.carModel.trim() || null,
        car_color: newCar.carColor.trim() || null
      };

      console.log('Sending car data:', carData);

      const response = await apiClient.post('/cars', carData);
      if (response.data.success) {
        await fetchCars(); // Refresh the list
        setNewCar({
          plateNumber: '',
          driverName: '',
          phoneNumber: '',
          carModel: '',
          carColor: ''
        });
        setShowAddForm(false);
        setError('');
      }
    } catch (error) {
      console.error('Error adding car:', error);
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.errors?.join(', ') ||
                          'Error adding car. Please try again.';
      setError(errorMessage);
    }
  };





  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Cars Management</h1>
        <p className="text-slate-400">Manage all registered cars in the parking system</p>
      </div>

      {/* Add Car Button */}
      <div className="mb-6">
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setError('');
          }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-orange-500/25"
        >
          {showAddForm ? 'Cancel' : 'Add New Car'}
        </button>
      </div>

      {/* Add Car Form */}
      {showAddForm && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50 shadow-lg mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Add New Car</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleAddCar} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Plate Number</label>
              <input
                type="text"
                value={newCar.plateNumber}
                onChange={(e) => setNewCar({...newCar, plateNumber: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all duration-200"
                placeholder="e.g., RAB 123A"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Driver Name</label>
              <input
                type="text"
                value={newCar.driverName}
                onChange={(e) => setNewCar({...newCar, driverName: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all duration-200"
                placeholder="Driver's full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
              <input
                type="tel"
                value={newCar.phoneNumber}
                onChange={(e) => setNewCar({...newCar, phoneNumber: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all duration-200"
                placeholder="+250788123456"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Car Model</label>
              <input
                type="text"
                value={newCar.carModel}
                onChange={(e) => setNewCar({...newCar, carModel: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all duration-200"
                placeholder="e.g., Toyota Corolla"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Car Color</label>
              <input
                type="text"
                value={newCar.carColor}
                onChange={(e) => setNewCar({...newCar, carColor: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all duration-200"
                placeholder="e.g., White, Blue, Black"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <button
                type="submit"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200"
              >
                Add Car
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cars Table */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 lg:p-6 border border-slate-700/50 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg lg:text-xl font-bold text-white">Registered Cars ({cars.length})</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-3 text-slate-400">Loading cars...</span>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg mb-2">No cars registered yet</p>
            <p className="text-slate-500">Add your first car to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Plate Number</th>
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Driver Name</th>
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Phone Number</th>
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Car Model</th>
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Color</th>
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car.plate_number} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                    <td className="py-4 text-white font-medium text-sm lg:text-base">{car.plate_number}</td>
                    <td className="py-4 text-slate-300 text-sm lg:text-base">{car.driver_name}</td>
                    <td className="py-4 text-slate-300 text-sm lg:text-base">{car.phone_number}</td>
                    <td className="py-4 text-slate-300 text-sm lg:text-base">{car.car_model || 'N/A'}</td>
                    <td className="py-4 text-slate-300 text-sm lg:text-base">{car.car_color || 'N/A'}</td>
                    <td className="py-4">
                      <div className="flex space-x-2">
                        <span className="text-slate-400 text-sm">View Only</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 gap-4">
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h3 className="text-slate-400 text-sm font-medium mb-1">Total Registered Cars</h3>
            <p className="text-2xl font-bold text-white">{cars.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cars;
