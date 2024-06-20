import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../style/Login.module.css';

function Login() {
  const [values, setValues] = useState({ email: '', password: '' });
  const navigate = useNavigate();


  const handleSubmit = (event) => {
    event.preventDefault();
    if (!values.email || !values.password) {
      alert('Please fill in both email and password fields');
      return;
    }
    axios.post('http://localhost:8081/login', values)
      .then((response) => {
        if (response.data.Status === "Success") {
          const { token, role, userId, name } = response.data;
          // Store the token, role, userId, and name in local storage
          localStorage.setItem('token', token);
          localStorage.setItem('role', role);
          localStorage.setItem('userId', userId);
          localStorage.setItem('name', name);

          if (role === 'admin') {
            navigate('/admin'); 
          } else {
            navigate('/'); 
          }
        } else {
          alert("Error");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className={styles['login-container']}>
      <div className={styles.container}>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.mb3}>
            <label htmlFor="email" className={styles.formLabel}>Email:</label>
            <input type="email" className={styles.formControl} id="email" name="email" required 
              onChange={e => setValues({...values, email: e.target.value})}/>
          </div>
          <div className={styles.mb3}>
            <label htmlFor="password" className={styles.formLabel}>Password:</label>
            <input type="password" className={styles.formControl} id="password" name="password" required 
              onChange={e => setValues({...values, password: e.target.value})}/>
          </div>
          <button type="submit" className={styles.btnPrimary}>Submit</button>
          <Link to="/register" className={styles.linkBtn}>Sign Up</Link>
        </form>
      </div>
    </div>
  );
}

export default Login;
