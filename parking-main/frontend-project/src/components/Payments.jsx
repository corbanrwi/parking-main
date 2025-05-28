import { useState, useEffect } from 'react';
import { apiClient } from '../config/api';
import { formatMoneyCompact, formatMoneyDetailed, formatDuration } from '../utils/formatters';

const Payments = () => {
  const [completedRecords, setCompletedRecords] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const [filterStatus, setFilterStatus] = useState('All');
  const [filterMethod, setFilterMethod] = useState('All');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching payments data...');

      const [recordsResponse, paymentsResponse] = await Promise.all([
        apiClient.get('/parking/records'),
        apiClient.get('/payments')
      ]);

      console.log('Records response:', recordsResponse.data);
      console.log('Payments response:', paymentsResponse.data);

      // Filter completed records (those with exit_time and status = 'completed')
      const allCompleted = recordsResponse.data.data?.filter(record =>
        record.exit_time && record.status === 'completed' && record.total_amount > 0
      ) || [];

      // Get list of record IDs that already have payments
      const paidRecordIds = new Set(
        paymentsResponse.data.data?.map(payment => payment.record_id) || []
      );

      // Filter out records that already have payments
      const unpaidCompleted = allCompleted.filter(record =>
        !paidRecordIds.has(record.record_id)
      );

      console.log('All completed records:', allCompleted.length);
      console.log('Already paid records:', paidRecordIds.size);
      console.log('Unpaid completed records for payment:', unpaidCompleted.length);

      // Enhance payments with parking record data
      const allRecords = recordsResponse.data.data || [];
      const enhancedPayments = (paymentsResponse.data.data || []).map(payment => {
        const relatedRecord = allRecords.find(record => record.record_id === payment.record_id);
        if (relatedRecord) {
          return {
            ...payment,
            // Add parking record data to payment
            entry_time: relatedRecord.entry_time,
            exit_time: relatedRecord.exit_time,
            duration_minutes: relatedRecord.duration_minutes,
            slot_number: relatedRecord.slot_number,
            plate_number: relatedRecord.plate_number,
            driver_name: relatedRecord.driver_name
          };
        }
        return payment;
      });

      console.log('Enhanced payments with parking data:', enhancedPayments);
      setCompletedRecords(unpaidCompleted);
      setPayments(enhancedPayments);
    } catch (error) {
      console.error('Error fetching data:', error);
      setCompletedRecords([]);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();

    const record = completedRecords.find(r => r.record_id === parseInt(selectedRecord));

    if (!record) {
      alert('Please select a completed parking record');
      return;
    }

    try {
      // Map to backend field names
      const paymentData = {
        record_id: record.record_id,
        amount_paid: record.total_amount,
        payment_method: paymentMethod.toLowerCase().replace(' ', '_'), // 'mobile money' -> 'mobile_money'
        payment_status: 'completed'
      };

      console.log('Creating payment:', paymentData);

      const response = await apiClient.post('/payments', paymentData);
      if (response.data.success) {
        await fetchData(); // Refresh all data
        setSelectedRecord('');
        setPaymentMethod('cash');
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.errors?.join(', ') ||
                          'Error adding payment. Please try again.';
      alert(errorMessage);
    }
  };



  const handleGenerateReceipt = async (paymentId) => {
    try {
      console.log('Generating receipt for payment:', paymentId);
      const response = await apiClient.get(`/payments/${paymentId}/invoice`);

      if (response.data.success) {
        const invoice = response.data.data;

        // Create a new window for the receipt
        const receiptWindow = window.open('', '_blank', 'width=800,height=600');

        // Generate receipt HTML
        const receiptHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Payment Receipt - ${invoice.payment.receipt_number}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
              .receipt { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
              .company-name { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 5px; }
              .company-location { color: #666; font-size: 14px; }
              .receipt-title { font-size: 20px; font-weight: bold; color: #e97316; margin: 20px 0; }
              .info-section { margin: 20px 0; }
              .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
              .info-label { font-weight: bold; color: #333; }
              .info-value { color: #666; }
              .amount-section { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .total-amount { font-size: 18px; font-weight: bold; color: #e97316; }
              .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
              @media print { body { background: white; } .receipt { box-shadow: none; } }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="header">
                <div class="company-name">${invoice.company.name}</div>
                <div class="company-location">${invoice.company.location}</div>
                <div class="receipt-title">PARKING PAYMENT RECEIPT</div>
              </div>

              <div class="info-section">
                <div class="info-row">
                  <span class="info-label">Receipt Number:</span>
                  <span class="info-value">${invoice.payment.receipt_number}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Payment Date:</span>
                  <span class="info-value">${new Date(invoice.payment.payment_date).toLocaleString()}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Payment Method:</span>
                  <span class="info-value">${invoice.payment.payment_method.replace('_', ' ').toUpperCase()}</span>
                </div>
              </div>

              <div class="info-section">
                <h3 style="color: #333; margin-bottom: 15px;">Parking Details</h3>
                <div class="info-row">
                  <span class="info-label">Plate Number:</span>
                  <span class="info-value">${invoice.parking.plate_number}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Driver Name:</span>
                  <span class="info-value">${invoice.parking.driver_name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Parking Slot:</span>
                  <span class="info-value">${invoice.parking.slot_number} (${invoice.parking.slot_type})</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Entry Time:</span>
                  <span class="info-value">${new Date(invoice.parking.entry_time).toLocaleString()}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Exit Time:</span>
                  <span class="info-value">${new Date(invoice.parking.exit_time).toLocaleString()}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Duration:</span>
                  <span class="info-value">${invoice.parking.duration}</span>
                </div>
              </div>

              <div class="amount-section">
                <div class="info-row">
                  <span class="info-label">Total Amount:</span>
                  <span class="info-value">${invoice.parking.total_amount.toLocaleString()} RWF</span>
                </div>
                <div class="info-row total-amount">
                  <span>Amount Paid:</span>
                  <span>${invoice.payment.amount_paid.toLocaleString()} RWF</span>
                </div>
              </div>

              <div class="footer">
                <p>Processed by: ${invoice.processed_by}</p>
                <p>Generated on: ${new Date(invoice.generated_at).toLocaleString()}</p>
                <p>Thank you for using SmartPark!</p>
              </div>
            </div>

            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
          </html>
        `;

        receiptWindow.document.write(receiptHTML);
        receiptWindow.document.close();
      }
    } catch (error) {
      console.error('Error generating receipt:', error);
      const errorMessage = error.response?.data?.message || 'Error generating receipt. Please try again.';
      alert(errorMessage);
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'cash':
        return 'bg-green-500/20 text-green-400';
      case 'mobile_money':
        return 'bg-blue-500/20 text-blue-400';
      case 'card':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };



  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const statusMatch = filterStatus === 'All' || payment.payment_status === filterStatus.toLowerCase();
    const methodMatch = filterMethod === 'All' || payment.payment_method === filterMethod.toLowerCase().replace(' ', '_');
    return statusMatch && methodMatch;
  });

  const totalRevenue = payments.reduce((sum, payment) => {
    const amount = payment.amount_paid || payment.total_amount || payment.amount || 0;
    return sum + Number(amount);
  }, 0);

  const todayRevenue = payments
    .filter(payment => {
      const paymentDate = new Date(payment.payment_date).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      return paymentDate === today;
    })
    .reduce((sum, payment) => {
      const amount = payment.amount_paid || payment.total_amount || payment.amount || 0;
      return sum + Number(amount);
    }, 0);
  const cashPayments = payments.filter(payment => payment.payment_method === 'cash').length;
  const digitalPayments = payments.filter(payment => payment.payment_method !== 'cash').length;

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Payments Management</h1>
        <p className="text-slate-400">Track all parking payments and revenue</p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700/50">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Total Revenue</h3>
          <p className="text-2xl font-bold text-white">{formatMoneyCompact(totalRevenue)} RWF</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700/50">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Today's Revenue</h3>
          <p className="text-2xl font-bold text-white">{formatMoneyCompact(todayRevenue)} RWF</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700/50">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Cash Payments</h3>
          <p className="text-2xl font-bold text-white">{cashPayments}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700/50">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Digital Payments</h3>
          <p className="text-2xl font-bold text-white">{digitalPayments}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-orange-500/25"
        >
          {showAddForm ? 'Cancel' : 'Add Payment'}
        </button>

        <div className="flex gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="All">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>

          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="All">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="Mobile Money">Mobile Money</option>
            <option value="Card">Card</option>
          </select>
        </div>
      </div>

      {/* Add Payment Form */}
      {showAddForm && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50 shadow-lg mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Record Payment for Completed Parking</h2>

          {completedRecords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 text-lg mb-2">No unpaid completed parking records found</p>
              <p className="text-slate-500">All completed parking records have already been paid, or there are no completed records yet.</p>
            </div>
          ) : (
            <form onSubmit={handleAddPayment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Select Completed Parking Record</label>
              <select
                value={selectedRecord}
                onChange={(e) => setSelectedRecord(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all duration-200"
                required
              >
                <option value="">Choose a completed parking record...</option>
                {completedRecords.map((record) => (
                  <option key={record.record_id} value={record.record_id}>
                    {record.plate_number} - Slot {record.slot_number} - {formatMoneyDetailed(record.total_amount)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 transition-all duration-200"
              >
                <option value="cash">Cash</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="card">Card</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200"
              >
                Record Payment
              </button>
            </div>
          </form>
          )}
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 lg:p-6 border border-slate-700/50 shadow-lg">
        <h2 className="text-lg lg:text-xl font-bold text-white mb-4">
          Payment Records ({filteredPayments.length})
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-3 text-slate-400">Loading payments...</span>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg mb-2">No payment records found</p>
            <p className="text-slate-500">Record your first payment to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Plate Number</th>
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Driver</th>
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Amount</th>
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Payment Date</th>
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Method</th>
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Duration</th>
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Slot</th>
                  <th className="text-left text-slate-400 font-medium py-3 text-sm lg:text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                <tr key={payment.payment_id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                  <td className="py-4 text-white font-medium text-sm lg:text-base">{payment.plate_number || 'N/A'}</td>
                  <td className="py-4 text-slate-300 text-sm lg:text-base">{payment.driver_name || 'N/A'}</td>
                  <td className="py-4 text-green-400 font-medium text-sm lg:text-base">
                    {formatMoneyDetailed(payment.amount_paid || payment.total_amount || payment.amount || 0)}
                  </td>
                  <td className="py-4 text-slate-300 text-sm lg:text-base">
                    {new Date(payment.payment_date).toLocaleString()}
                  </td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(payment.payment_method)}`}>
                      {payment.payment_method.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 text-slate-300 text-sm lg:text-base">
                    {(() => {
                      // Try multiple possible duration field names
                      const duration = payment.duration_minutes ||
                                     payment.duration ||
                                     payment.parking_duration ||
                                     payment.total_duration ||
                                     payment.record?.duration_minutes ||
                                     payment.parking_record?.duration_minutes;

                      if (duration && duration > 0) {
                        return formatDuration(duration);
                      }

                      // Calculate duration from entry and exit times if available
                      const entryTime = payment.entry_time || payment.record?.entry_time || payment.parking_record?.entry_time;
                      const exitTime = payment.exit_time || payment.record?.exit_time || payment.parking_record?.exit_time;

                      if (entryTime && exitTime) {
                        const entry = new Date(entryTime);
                        const exit = new Date(exitTime);
                        const durationMs = exit - entry;
                        const durationMinutes = Math.round(durationMs / (1000 * 60));
                        if (durationMinutes > 0) {
                          return formatDuration(durationMinutes);
                        }
                      }

                      // If we have a record_id, we could potentially fetch the parking record
                      // For now, show a placeholder that indicates data is available
                      if (payment.record_id) {
                        return 'Available';
                      }

                      return 'N/A';
                    })()}
                  </td>
                  <td className="py-4 text-slate-300 text-sm lg:text-base">{payment.slot_number || 'N/A'}</td>
                  <td className="py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleGenerateReceipt(payment.payment_id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Receipt
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

export default Payments;
