import { useState, useEffect } from 'react';
import { Users, UserRoundCog, CalendarCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
          supabase.from('patients').select('*', { count: 'exact', head: true }),
          supabase.from('doctors').select('*', { count: 'exact', head: true }),
          supabase.from('appointments').select('*', { count: 'exact', head: true })
        ]);

        setStats({
          patients: patientsRes.count || 0,
          doctors: doctorsRes.count || 0,
          appointments: appointmentsRes.count || 0
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Hospital Overview</h1>
      </div>

      <div className="dashboard-stats">
        {/* Patients Stat */}
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--secondary)' }}>
            <Users size={28} />
          </div>
          <div className="stat-info">
            <h3>Total Patients</h3>
            <p>{loading ? '...' : stats.patients}</p>
          </div>
        </div>

        {/* Doctors Stat */}
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
            <UserRoundCog size={28} />
          </div>
          <div className="stat-info">
            <h3>Available Doctors</h3>
            <p>{loading ? '...' : stats.doctors}</p>
          </div>
        </div>

        {/* Appointments Stat */}
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(79, 70, 229, 0.15)', color: 'var(--primary)' }}>
            <CalendarCheck size={28} />
          </div>
          <div className="stat-info">
            <h3>Total Appointments</h3>
            <p>{loading ? '...' : stats.appointments}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
