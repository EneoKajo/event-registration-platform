import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../style/Register.module.css';

function Register() {
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    axios.post('http://localhost:8081/register', values)
      .then((response) => {
        if (response.data.Status === "Success") {
          navigate('/login');
        } else {
          alert("Error");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className={styles['register-container']}>
      <div className={styles.container}>
        <h2>Signup Form</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.mb3}>
            <label htmlFor="name" className={styles.formLabel}>Name:</label>
            <input type="text" className={styles.formControl} id="name" name="name" required
              onChange={e => setValues({...values, name: e.target.value})} />
          </div>
          <div className={styles.mb3}>
            <label htmlFor="email" className={styles.formLabel}>Email:</label>
            <input type="email" className={styles.formControl} id="email" name="email" required
              onChange={e => setValues({...values, email: e.target.value})} />
          </div>
          <div className={styles.mb3}>
            <label htmlFor="password" className={styles.formLabel}>Password:</label>
            <input type="password" className={styles.formControl} id="password" name="password" required
              onChange={e => setValues({...values, password: e.target.value})} />
          </div>
          <button type="submit" className={styles.btnPrimary}>Submit</button>
          <Link to="/login" className={styles.linkBtn}>Log In</Link>
        </form>
      </div>
    </div>
  );
}

export default Register;
