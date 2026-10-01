import React, { useState, useEffect } from 'react';

function History({ token }) {
  const [tickets, setTickets] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [tRes, vRes] = await Promise.all([ fetch('/api/services', { headers }), fetch('/api/vehicles', { headers }) ]);
      setTickets(await tRes.json()); setVehicles(await vRes.json());
    };
    fetchData();
  }, [token]);

  const displayedHistory = tickets
    .filter(t => t.status === 'Completed')
    .filter(t => selectedVehicle === 'All' || t.vehicle.id === Number(selectedVehicle))
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

  return (
    <div className="card">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', borderBottom:'1px solid #1f2937', paddingBottom:'16px'}}>
        <h2 style={{margin:0, border:0, padding:0}}>Service History</h2>
        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
          <label style={{margin:0}}>Filter Registry:</label>
          <select style={{width:'200px', padding:'6px 10px'}} value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}>
            <option value="All">All Vehicles</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.licensePlate}</option>)}
          </select>
        </div>
      </div>
      
      <table>
        <thead><tr><th>Order ID</th><th>License Plate</th><th>Vehicle Model</th><th>Service Performed</th><th>Completion Date</th><th>Status</th></tr></thead>
        <tbody>
          {displayedHistory.length === 0 ? (<tr><td colSpan="6" style={{textAlign:'center', color:'#9ca3af'}}>No historical records found.</td></tr>) : 
           displayedHistory.map(t => (
            <tr key={t.id}>
              <td>#{t.id}</td>
              <td style={{fontWeight:'bold'}}>{t.vehicle.licensePlate}</td>
              <td style={{color:'#9ca3af'}}>{t.vehicle.makeAndModel}</td>
              <td>{t.serviceType}</td>
              <td>{t.appointmentDate}</td>
              <td><span className="status completed">Completed</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default History;
