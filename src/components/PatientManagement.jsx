import { useState, useEffect } from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'Male', contact: '', disease: '', address: ''
  });

  const fetchPatients = async () => {
    const { data, error } = await supabase.from('patients').select('*').order('id', { ascending: false });
    if (error) console.error(error);
    else setPatients(data || []);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('patients').insert([formData]);
    if (error) {
      console.error(error);
    } else {
      fetchPatients();
      setFormData({ name: '', age: '', gender: 'Male', contact: '', disease: '', address: '' });
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this patient?')) {
      const { error } = await supabase.from('patients').delete().eq('id', id);
      if (error) console.error(error);
      else fetchPatients();
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Patient Management</h1>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlus size={20} color="var(--primary)" /> Add New Patient
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input required type="text" className="form-input" 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input required type="number" className="form-input" 
                value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} 
                placeholder="45" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-select" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <input required type="tel" className="form-input" 
                value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} 
                placeholder="+1 234 567 890" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Disease/Condition</label>
              <input required type="text" className="form-input" 
                value={formData.disease} onChange={e => setFormData({...formData, disease: e.target.value})} 
                placeholder="Fever" />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input required type="text" className="form-input" 
                value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} 
                placeholder="123 Health St." />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Save Patient Record</button>
        </form>
      </div>

    </div>
  );
}
