import React, {useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import axios from 'axios';
import styles from '../style/AddEvent.module.css';

function AddUser(){
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [auth, setAuth] = useState(false);
    const navigate = useNavigate();
    axios.defaults.withCredentials = true;

    useEffect(() =>{
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
      }, []);


      const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
          const response = await axios.post('http://localhost:8081/admin/add-user', {
            name,
            email,
            role,
            password,
          });
    
          if (response.data.Status === "Success") {
            navigate('/admin', { replace: true });
          } else {
            setError('Failed to add user');
          }
        } catch (error) {
          setError('Failed to add user');
          console.error('Error adding user:', error);
        }
      };
    

      if (!auth) {
        return (
          <div className={styles.content}>
            <div className={styles.container}>
              <h3>You are not authorized to access this page</h3>
              <Link to="/login" className={`${styles.btn} ${styles.btnPrimary}`}>Login</Link>
            </div>
          </div>
        );
      }
    
      return (
        <div className={styles.content}>
          <div className={styles.container}>
            <h3>Add User</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.mb3}>
                <label htmlFor="name" className={styles.formLabel}>Users Name:</label>
                <input
                  type="text"
                  className={styles.formControl}
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className={styles.mb3}>
                <label htmlFor="email" className={styles.formLabel}>Email:</label>
                <input
                  type="email"
                  className={styles.formControl}
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className={styles.mb3}>
                <label htmlFor="role" className={styles.formLabel}>Role:</label>
                <input
                  type="text"
                  className={styles.formControl}
                  id="role"
                  value={role || ''} // Set value to empty string if it's null
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
              <div className={styles.mb3}>
                <label htmlFor="password" className={styles.formLabel}>Password:</label>
                <input
                  type="password"
                  className={styles.formControl}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className={styles.alertDanger} role="alert">{error}</div>}
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Submit</button>
              <Link to="/admin" className={`${styles.btn} ${styles.btnSecondary} ${styles.ms2}`}>Cancel</Link>
            </form>
          </div>
        </div>
      );
    }
    
    export default AddUser;