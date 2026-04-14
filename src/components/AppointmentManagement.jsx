import { useState, useEffect } from 'react';
import { CalendarDays, CheckCircle, Trash2, Edit, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    patient_id: '', doctor_id: '', date: '', time: '', reason: ''
  });

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, patients(name), doctors(name)')
      .order('date', { ascending: false })
      .order('time', { ascending: false });
      
    if (error) {
      console.error(error);
    } else {
      const formattedData = (data || []).map(appt => ({
        ...appt,
        patient_name: appt.patients?.name || 'Unknown',
        doctor_name: appt.doctors?.name || 'Unknown'
      }));
      setAppointments(formattedData);
    }
  };

  useEffect(() => {
    fetchAppointments();
    
    // Fetch dropdown data
    supabase.from('patients').select('*').then(({ data }) => setPatients(data || []));
    supabase.from('doctors').select('*').then(({ data }) => setDoctors(data || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      const { error } = await supabase.from('appointments').update({
        ...formData
      }).eq('id', editingId);
      
      if (error) {
        console.error(error);
      } else {
        fetchAppointments();
        setFormData({ patient_id: '', doctor_id: '', date: '', time: '', reason: '' });
        setEditingId(null);
      }
    } else {
      const { error } = await supabase.from('appointments').insert([{
        ...formData,
        status: 'Scheduled'
      }]);
      
      if (error) {
        console.error(error);
      } else {
        fetchAppointments();
        setFormData({ patient_id: '', doctor_id: '', date: '', time: '', reason: '' });
      }
    }
  };

  const deleteAppointment = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) console.error(error);
      else fetchAppointments();
    }
  };

  const handleEditClick = (appt) => {
    setFormData({
      patient_id: appt.patient_id,
      doctor_id: appt.doctor_id,
      date: appt.date,
      time: appt.time,
      reason: appt.reason
    });
    setEditingId(appt.id);
    
    // Smooth scroll to top for editing
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const completeAppointment = async (id) => {
    const { error } = await supabase.from('appointments').update({ status: 'Completed' }).eq('id', id);
    if (error) console.error(error);
    else fetchAppointments();
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Appointment Scheduling</h1>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CalendarDays size={20} color="var(--primary)" /> {editingId ? 'Edit Appointment' : 'Book Appointment'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Select Patient</label>
              <select required className="form-select" value={formData.patient_id} onChange={e => setFormData({...formData, patient_id: e.target.value})}>
                <option value="">-- Choose Patient --</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Select Doctor</label>
              <select required className="form-select" value={formData.doctor_id} onChange={e => setFormData({...formData, doctor_id: e.target.value})}>
                <option value="">-- Choose Doctor --</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.name} - {d.specialization}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input required type="date" className="form-input" 
                value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input required type="time" className="form-input" 
                value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Reason for Visit</label>
            <input required type="text" className="form-input" 
              value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} 
              placeholder="Checkup / Follow up" />
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button type="submit" className="btn btn-primary">{editingId ? 'Update Appointment' : 'Book Appointment'}</button>
            {editingId && (
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setEditingId(null);
                  setFormData({ patient_id: '', doctor_id: '', date: '', time: '', reason: '' });
                }}
                style={{ 
                  backgroundColor: 'transparent', 
                  border: '1px solid var(--border)', 
                  color: 'var(--text-secondary)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1.5rem' }}>Scheduled Appointments</h2>
        {appointments.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No appointments found.</p>
        ) : (
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Patient</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Doctor</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Date & Time</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Reason</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(appt => (
                  <tr key={appt.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>{appt.patient_name}</td>
                    <td style={{ padding: '1rem' }}>{appt.doctor_name}</td>
                    <td style={{ padding: '1rem' }}>{appt.date} at {appt.time}</td>
                    <td style={{ padding: '1rem' }}>{appt.reason}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '9999px', 
                        fontSize: '0.875rem',
                        backgroundColor: appt.status === 'Completed' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(2, 132, 199, 0.1)',
                        color: appt.status === 'Completed' ? '#22c55e' : 'var(--primary)'
                      }}>
                        {appt.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {appt.status !== 'Completed' && (
                          <button 
                            onClick={() => completeAppointment(appt.id)}
                            style={{ padding: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#22c55e' }}
                            title="Mark Completed"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleEditClick(appt)}
                          style={{ padding: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => deleteAppointment(appt.id)}
                          style={{ padding: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                          title="Delete"
                        >
                          <Trash2 size={18} />
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
}
