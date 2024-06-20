import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import style from '../style/EditEvent.module.css';

function AdminEditUser({ from }) {
  const { id: userId } = useParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false); 
  const [error, setError] = useState('');
  const navigate = useNavigate();
  axios.defaults.withCredentials = true;

  useEffect(() => {
    axios.get('http://localhost:8081/admin')
      .then((response) => {
        if (response.data.Status === "Success") {
          setAuth(true);
        } else {
          setAuth(false);
          setError('You are not authorized to access this page');
          navigate('/login'); 
        }
      })
      .catch((error) => {
        console.log(error);
        setAuth(false);
        setError('Failed to load data');
        navigate('/login'); 
      });
    axios.get(`http://localhost:8081/admin/users/${userId}`)
      .then(response => {
        if (response.data.Status === "Success") {
          const user = response.data.user;
          setName(user.name);
          setEmail(user.email);
          setRole(user.role);
          setAuth(true); 
        } else {
          setError('Error fetching user details');
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching user details:', error);
        setLoading(false);
        setError('Failed to load data');
      });
  }, [userId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`http://localhost:8081/admin/users/${userId}`, {
        name,
        email,
        password,
        role 
      });
      if (response.data.Status === "Success") {
        
        const submitButton = event.target.querySelector('button[type="submit"]');
        submitButton.style.backgroundColor = 'green';
        submitButton.style.color = 'white';
        submitButton.disabled = true;
        submitButton.innerHTML = 'Saved!';
        const checkmarkIcon = document.createElement('i');
        checkmarkIcon.className = 'fas fa-check';
        submitButton.appendChild(checkmarkIcon);
      } else {
        console.error('Server error:', response.data.Error);
      }
    } catch (error) {
      console.error('Error submitting the form:', error);
    }
  };

  if (!auth) {
    return (
      <div className={style.content}>
        <div className={style.container}>
          <h3>{error}</h3>
          <Link to="/login" className={`${style.btn} ${style.btnPrimary}`}>Login</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <div className={style.content}>
      <h2>Edit User</h2>
      <div className={style.container}>
        <form onSubmit={handleSubmit}>
          <label className={style.formLabel}>
            Name:
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={style.formControl} />
          </label>
          <br />
          <label className={style.formLabel}>
            Email:
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={style.formControl} />
          </label>
          <br />
          <label className={style.formLabel}>
            Password:
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={style.formControl} />
          </label>
          <br />
          <br />
          <label className={style.formLabel}>
            Role:
            <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className={style.formControl} />
          </label>
          <br />
          <button type="submit" className={`${style.btn} ${style.btnPrimary}`}>Save Changes</button>
          <Link to={from} className={`${style.btn} ${style.btnSecondary} ${style.ms2}`}>Cancel</Link>
        </form>
      </div>
    </div>
  );
}

export default AdminEditUser;
