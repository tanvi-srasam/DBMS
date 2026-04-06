import { useState, useEffect } from 'react';
import { UserRoundCog, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    name: '', specialization: '', contact: '', email: '', availability: ''
  });

  const fetchDoctors = async () => {
    const { data, error } = await supabase.from('doctors').select('*').order('id', { ascending: false });
    if (error) console.error(error);
    else setDoctors(data || []);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('doctors').insert([formData]);
    if (error) {
      console.error(error);
    } else {
      fetchDoctors();
      setFormData({ name: '', specialization: '', contact: '', email: '', availability: '' });
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this doctor?')) {
      const { error } = await supabase.from('doctors').delete().eq('id', id);
      if (error) console.error(error);
      else fetchDoctors();
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Doctor Management</h1>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserRoundCog size={20} color="var(--primary)" /> Add New Doctor
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Doctor Name</label>
              <input required type="text" className="form-input" 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="Dr. Gregory House" />
            </div>
            <div className="form-group">
              <label className="form-label">Specialization</label>
              <input required type="text" className="form-input" 
                value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} 
                placeholder="Cardiology" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <input required type="tel" className="form-input" 
                value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} 
                placeholder="+1 234 567 890" />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input required type="email" className="form-input" 
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
                placeholder="doctor@hospital.com" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Availability (Days/Hours)</label>
            <input required type="text" className="form-input" 
              value={formData.availability} onChange={e => setFormData({...formData, availability: e.target.value})} 
              placeholder="Mon-Fri, 9AM-5PM" />
          </div>
          <button type="submit" className="btn btn-primary">Save Doctor Profile</button>
        </form>
      </div>

    </div>
  );
}
