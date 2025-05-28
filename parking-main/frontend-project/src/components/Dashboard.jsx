import { useState, useEffect } from 'react';
import { apiClient } from '../config/api';
import { formatMoneyCompact, formatMoneyDetailed } from '../utils/formatters';
import Cars from './Cars';
import ParkingSlots from './ParkingSlots';
import ParkingRecords from './ParkingRecords';
import Payments from './Payments';
import Reports from './Reports';

const Dashboard = ({ user, onLogout }) => {
  const [dashboardData, setDashboardData] = useState({
    totalCars: 0,
    totalParkingSlots: 0,
    availableSlots: 0,
    occupiedSlots: 0,
    totalParkingRecords: 0,
    activeRecords: 0,
    completedRecords: 0,
    totalRevenue: 0,
    totalPayments: 0,
    recentRecords: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...');

      const [carsResponse, slotsResponse, recordsResponse, paymentsResponse] = await Promise.all([
        apiClient.get('/cars'),
        apiClient.get('/slots'),
        apiClient.get('/parking/records'),
        apiClient.get('/payments')
      ]);

      console.log('Dashboard API responses:', {
        cars: carsResponse.data,
        slots: slotsResponse.data,
        records: recordsResponse.data,
        payments: paymentsResponse.data
      });

      const cars = carsResponse.data.data || [];
      const slots = slotsResponse.data.data || [];
      const records = recordsResponse.data.data || [];
      const payments = paymentsResponse.data.data || [];

      // Calculate total revenue from payments with better field handling
      const totalRevenue = payments.reduce((sum, payment) => {
        const amount = payment.amount_paid || payment.total_amount || payment.amount || 0;
        console.log('Payment amount:', payment, 'Amount used:', amount);
        return sum + Number(amount);
      }, 0);

      console.log('Total revenue calculated:', totalRevenue, 'from', payments.length, 'payments');

      // Get recent records (last 5, sorted by entry time)
      const recentRecords = records
        .sort((a, b) => new Date(b.entry_time) - new Date(a.entry_time))
        .slice(0, 5);

      // Calculate additional stats
      const availableSlots = slots.filter(slot => slot.slot_status === 'available').length;
      const occupiedSlots = slots.filter(slot => slot.slot_status === 'occupied').length;
      const activeRecords = records.filter(record =>
        record.status && (record.status.toLowerCase() === 'active' || record.status === 'Active')
      ).length;
      const completedRecords = records.filter(record =>
        record.status && (record.status.toLowerCase() === 'completed' || record.status === 'Completed')
      ).length;

      setDashboardData({
        totalCars: cars.length,
        totalParkingSlots: slots.length,
        availableSlots,
        occupiedSlots,
        totalParkingRecords: records.length,
        activeRecords,
        completedRecords,
        totalRevenue,
        totalPayments: payments.length,
        recentRecords
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData({
        totalCars: 0,
        totalParkingSlots: 0,
        availableSlots: 0,
        occupiedSlots: 0,
        totalParkingRecords: 0,
        activeRecords: 0,
        completedRecords: 0,
        totalRevenue: 0,
        totalPayments: 0,
        recentRecords: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // For demo purposes, just logout locally
      // Uncomment below if you want to logout with real backend:
      /*
      await axios.post('http://localhost:3000/api/auth/logout', {}, {
        withCredentials: true
      });
      */
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      onLogout(); // Logout anyway
    }
  };

  const sidebarItems = [
    { name: 'Dashboard', active: true },
    { name: 'Cars', active: false },
    { name: 'Parking Slots', active: false },
    { name: 'Parking Records', active: false },
    { name: 'Payments', active: false },
    { name: 'Reports', active: false }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Cars':
        return <Cars />;
      case 'Parking Slots':
        return <ParkingSlots />;
      case 'Parking Records':
        return <ParkingRecords />;
      case 'Payments':
        return <Payments />;
      case 'Reports':
        return <Reports />;
      default:
        return renderDashboardContent();
    }
  };

  const renderDashboardContent = () => (
    <div className="p-4 lg:p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Total Cars */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 lg:p-6 border border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-200">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Registered Cars</h3>
          <p className="text-2xl lg:text-3xl font-bold text-blue-400">{dashboardData.totalCars}</p>
          <p className="text-slate-500 text-xs mt-1">Total vehicles in system</p>
        </div>

        {/* Available Slots */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 lg:p-6 border border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-200">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Available Slots</h3>
          <p className="text-2xl lg:text-3xl font-bold text-green-400">{dashboardData.availableSlots}</p>
          <p className="text-slate-500 text-xs mt-1">of {dashboardData.totalParkingSlots} total slots</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 lg:p-6 border border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-200">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Total Revenue</h3>
          <p className="text-2xl lg:text-3xl font-bold text-green-400">{formatMoneyCompact(dashboardData.totalRevenue)} RWF</p>
          <p className="text-slate-500 text-xs mt-1">From {dashboardData.totalPayments} payments</p>
        </div>
      </div>



      {/* Recent Parking Records */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 lg:p-6 border border-slate-700/50 shadow-lg">
        <h2 className="text-lg lg:text-xl font-bold text-white mb-4 lg:mb-6">Recent Parking Records</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-3 text-slate-400">Loading...</span>
          </div>
        ) : dashboardData.recentRecords.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No parking records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Plate Number</th>
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Slot</th>
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Entry Time</th>
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Status</th>
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Duration</th>
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Amount</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentRecords.map((record, index) => (
                  <tr key={record.record_id || index} className="border-b border-slate-700/50">
                    <td className="py-3 text-white text-sm lg:text-base font-medium">{record.plate_number}</td>
                    <td className="py-3 text-slate-300 text-sm lg:text-base">{record.slot_number}</td>
                    <td className="py-3 text-slate-300 text-sm lg:text-base">
                      {new Date(record.entry_time).toLocaleString()}
                    </td>
                    <td className="py-3 text-sm lg:text-base">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === 'active'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {record.status === 'active' ? 'Active' : 'Completed'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300 text-sm lg:text-base">
                      {record.duration_minutes ? `${record.duration_minutes}m` : 'Ongoing'}
                    </td>
                    <td className="py-3 text-white text-sm lg:text-base font-medium">
                      {record.total_amount ? formatMoneyDetailed(record.total_amount) : '-'}
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

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-orange-500 text-white p-2 rounded-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col transform transition-transform duration-300 ease-in-out border-r border-slate-700/50 lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-lg font-bold rounded-lg p-2 mr-3 shadow-lg">
              SmartPark
            </div>
            <div>
              <h1 className="text-white font-semibold">Parking Management</h1>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => {
                    setActiveTab(item.name);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeTab === item.name
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold shadow-lg">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ml-3">
              <p className="text-white font-medium">User Name</p>
              <p className="text-slate-400 text-sm">Member</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-red-500/25"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/50 px-4 lg:px-6 py-4 pt-16 lg:pt-4 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white">SmartPark PSMS</h1>
              <p className="text-slate-400 text-sm lg:text-base">Parking Space Management System</p>
            </div>
            <div className="text-left lg:text-right mt-2 lg:mt-0">
              <p className="text-slate-300 text-sm lg:text-base">Professional Parking Management</p>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="bg-slate-800 border-t border-slate-700 px-4 lg:px-6 py-4">
          <p className="text-center text-slate-500 text-xs lg:text-sm">
            © 2024 SmartPark PSMS. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
