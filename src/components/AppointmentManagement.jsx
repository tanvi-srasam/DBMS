import { useState, useEffect } from 'react';
import { CalendarDays, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
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
          <CalendarDays size={20} color="var(--primary)" /> Book Appointment
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
          <button type="submit" className="btn btn-primary">Book Appointment</button>
        </form>
      </div>

    </div>
  );
}
