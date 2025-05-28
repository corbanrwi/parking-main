import { useState, useEffect } from 'react';
import { apiClient } from '../config/api';
import { formatMoneyCompact, formatMoneyDetailed } from '../utils/formatters';

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    totalPayments: 0,
    averagePayment: 0,
    paymentMethods: {
      cash: 0,
      mobile_money: 0,
      card: 0
    },
    payments: [],
    dailyBreakdown: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching payment report data...');

      const paymentsResponse = await apiClient.get('/payments');
      console.log('Payments:', paymentsResponse.data);

      const allPayments = paymentsResponse.data.data || [];

      // Filter payments by date range
      const filteredPayments = filterPaymentsByDateRange(allPayments, dateRange);

      // Calculate payment metrics
      const reportMetrics = calculatePaymentMetrics(filteredPayments);

      setReportData(reportMetrics);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError('Failed to load payment report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterPaymentsByDateRange = (payments, dateRange) => {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    endDate.setHours(23, 59, 59, 999); // Include the entire end date

    return payments.filter(payment => {
      const paymentDate = new Date(payment.payment_date);
      return paymentDate >= startDate && paymentDate <= endDate;
    });
  };

  const calculatePaymentMetrics = (payments) => {
    // Revenue calculations with better field handling
    const totalRevenue = payments.reduce((sum, payment) => {
      const amount = payment.amount_paid || payment.total_amount || payment.amount || 0;
      return sum + Number(amount);
    }, 0);
    const averagePayment = payments.length > 0 ? Math.round(totalRevenue / payments.length) : 0;

    // Payment method breakdown
    const paymentMethods = payments.reduce((acc, payment) => {
      const method = payment.payment_method || 'cash';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, { cash: 0, mobile_money: 0, card: 0 });

    // Daily breakdown for chart
    const dailyBreakdown = payments.reduce((acc, payment) => {
      const date = new Date(payment.payment_date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, amount: 0, count: 0 };
      }
      const amount = payment.amount_paid || payment.total_amount || payment.amount || 0;
      acc[date].amount += Number(amount);
      acc[date].count += 1;
      return acc;
    }, {});

    return {
      totalRevenue,
      totalPayments: payments.length,
      averagePayment,
      paymentMethods,
      payments: payments.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date)),
      dailyBreakdown: Object.values(dailyBreakdown).sort((a, b) => new Date(a.date) - new Date(b.date))
    };
  };

  const handleGenerateReport = () => {
    fetchReportData();
  };

  const handlePrintReport = () => {
    window.print();
  };

  const exportToCSV = () => {
    const csvData = [
      ['SmartPark Payment Report'],
      ['Date Range', `${dateRange.startDate} to ${dateRange.endDate}`],
      ['Generated', new Date().toLocaleString()],
      [''],
      ['PAYMENT SUMMARY'],
      ['Total Revenue', `${reportData.totalRevenue.toLocaleString()} RWF`],
      ['Total Payments', reportData.totalPayments],
      ['Average Payment', `${reportData.averagePayment.toLocaleString()} RWF`],
      [''],
      ['PAYMENT METHODS'],
      ['Cash Payments', reportData.paymentMethods.cash],
      ['Mobile Money Payments', reportData.paymentMethods.mobile_money],
      ['Card Payments', reportData.paymentMethods.card],
      [''],
      ['PAYMENT DETAILS'],
      ['Date', 'Plate Number', 'Amount', 'Method', 'Receipt Number'],
      ...reportData.payments.map(payment => [
        new Date(payment.payment_date).toLocaleDateString(),
        payment.plate_number || 'N/A',
        payment.amount_paid || payment.total_amount || payment.amount || 0,
        payment.payment_method,
        payment.receipt_number || 'N/A'
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smartpark-payment-report-${dateRange.startDate}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 lg:p-6 print:p-8">
      <div className="mb-6 print:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white print:text-black mb-2">Payment Reports</h1>
        <p className="text-slate-400 print:text-gray-600">Revenue and payment analysis for SmartPark</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 print:hidden">
          {error}
        </div>
      )}

      {/* Report Controls */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 print:bg-white print:border print:border-gray-300 rounded-xl p-6 border border-slate-700/50 shadow-lg mb-6 print:shadow-none">
        <h2 className="text-xl font-bold text-white print:text-black mb-4">Payment Report Configuration</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 print:text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              className="w-full px-4 py-3 bg-slate-700/50 print:bg-white print:border-gray-300 border border-slate-600/50 rounded-lg text-white print:text-black focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 print:text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              className="w-full px-4 py-3 bg-slate-700/50 print:bg-white print:border-gray-300 border border-slate-600/50 rounded-lg text-white print:text-black focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all duration-200"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 print:hidden"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        <div className="flex gap-2 print:hidden">
          <button
            onClick={handlePrintReport}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
          >
            Print Report
          </button>
          <button
            onClick={exportToCSV}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12 print:hidden">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-slate-400">Loading payment data...</span>
        </div>
      ) : (
        <>
          {/* Payment Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 print:bg-white print:border print:border-gray-300 rounded-xl p-6 border border-slate-700/50 print:shadow-none">
              <h3 className="text-slate-400 print:text-gray-600 font-medium mb-4">Total Revenue</h3>
              <p className="text-3xl font-bold text-green-400 print:text-green-600">{formatMoneyCompact(reportData.totalRevenue)} RWF</p>
              <p className="text-slate-400 print:text-gray-500 text-sm mt-2">
                From {reportData.totalPayments} payments
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 print:bg-white print:border print:border-gray-300 rounded-xl p-6 border border-slate-700/50 print:shadow-none">
              <h3 className="text-slate-400 print:text-gray-600 font-medium mb-4">Total Payments</h3>
              <p className="text-3xl font-bold text-blue-400 print:text-blue-600">{reportData.totalPayments}</p>
              <p className="text-slate-400 print:text-gray-500 text-sm mt-2">
                Payment transactions
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 print:bg-white print:border print:border-gray-300 rounded-xl p-6 border border-slate-700/50 print:shadow-none">
              <h3 className="text-slate-400 print:text-gray-600 font-medium mb-4">Average Payment</h3>
              <p className="text-3xl font-bold text-orange-400 print:text-orange-600">{formatMoneyCompact(reportData.averagePayment)} RWF</p>
              <p className="text-slate-400 print:text-gray-500 text-sm mt-2">
                Per transaction
              </p>
            </div>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 print:bg-white print:border print:border-gray-300 rounded-xl p-6 border border-slate-700/50 shadow-lg print:shadow-none mb-6">
            <h3 className="text-xl font-bold text-white print:text-black mb-4">Payment Methods Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 print:text-green-600 mb-2">{reportData.paymentMethods.cash}</div>
                <div className="text-slate-300 print:text-gray-600 text-sm">Cash Payments</div>
                <div className="text-slate-400 print:text-gray-500 text-xs">
                  {reportData.totalPayments > 0 ? Math.round((reportData.paymentMethods.cash / reportData.totalPayments) * 100) : 0}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 print:text-blue-600 mb-2">{reportData.paymentMethods.mobile_money}</div>
                <div className="text-slate-300 print:text-gray-600 text-sm">Mobile Money</div>
                <div className="text-slate-400 print:text-gray-500 text-xs">
                  {reportData.totalPayments > 0 ? Math.round((reportData.paymentMethods.mobile_money / reportData.totalPayments) * 100) : 0}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 print:text-purple-600 mb-2">{reportData.paymentMethods.card}</div>
                <div className="text-slate-300 print:text-gray-600 text-sm">Card Payments</div>
                <div className="text-slate-400 print:text-gray-500 text-xs">
                  {reportData.totalPayments > 0 ? Math.round((reportData.paymentMethods.card / reportData.totalPayments) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details Table */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 print:bg-white print:border print:border-gray-300 rounded-xl p-6 border border-slate-700/50 shadow-lg print:shadow-none">
            <h3 className="text-xl font-bold text-white print:text-black mb-4">Payment Details</h3>
            {reportData.payments.length === 0 ? (
              <p className="text-slate-400 print:text-gray-500 text-center py-8">No payments found in selected date range</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-700 print:border-gray-300">
                      <th className="text-left text-slate-400 print:text-gray-600 font-medium py-3 text-sm">Date</th>
                      <th className="text-left text-slate-400 print:text-gray-600 font-medium py-3 text-sm">Receipt #</th>
                      <th className="text-left text-slate-400 print:text-gray-600 font-medium py-3 text-sm">Plate Number</th>
                      <th className="text-left text-slate-400 print:text-gray-600 font-medium py-3 text-sm">Amount</th>
                      <th className="text-left text-slate-400 print:text-gray-600 font-medium py-3 text-sm">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.payments.map((payment, index) => (
                      <tr key={payment.payment_id || index} className="border-b border-slate-700/50 print:border-gray-200">
                        <td className="py-3 text-white print:text-black text-sm">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-slate-300 print:text-gray-700 text-sm">
                          {payment.receipt_number || 'N/A'}
                        </td>
                        <td className="py-3 text-white print:text-black font-medium text-sm">
                          {payment.plate_number || 'N/A'}
                        </td>
                        <td className="py-3 text-green-400 print:text-green-600 font-bold text-sm">
                          {formatMoneyDetailed(payment.amount_paid || payment.total_amount || payment.amount || 0)}
                        </td>
                        <td className="py-3 text-slate-300 print:text-gray-700 text-sm capitalize">
                          {payment.payment_method?.replace('_', ' ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Report Footer */}
          <div className="mt-8 pt-6 border-t border-slate-700 print:border-gray-300 text-center">
            <p className="text-slate-400 print:text-gray-500 text-sm">
              Report generated on {new Date().toLocaleString()} | SmartPark Payment Management System
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
