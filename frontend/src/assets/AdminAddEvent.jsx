import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../style/AddEvent.module.css';

function AdminAddEvent() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [error, setError] = useState('');
  const [auth, setAuth] = useState(false);
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
          navigate('/login', { replace: true }); 
        }
      })
      .catch((error) => {
        console.log(error);
        setAuth(false);
        setError('Failed to load data');
        navigate('/login', { replace: true }); 
      });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8081/admin/add-event', {
        name,
        description,
        date,
        location,
        organizerName: organizer
      });

      if (response.data.Status === "Success") {
        navigate('/admin', { replace: true });
      } else {
        setError('Failed to add event');
      }
    } catch (error) {
      setError('Failed to add event');
      console.error('Error adding event:', error);
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
        <h3>Add Event</h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.mb3}>
            <label htmlFor="name" className={styles.formLabel}>Event Name:</label>
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
            <label htmlFor="description" className={styles.formLabel}>Event Description:</label>
            <textarea
              className={`${styles.formControl} ${styles.textarea}`}
              id="description"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <div className={styles.mb3}>
            <label htmlFor="date" className={styles.formLabel}>Event Date:</label>
            <input
              type="date"
              className={styles.formControl}
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className={styles.mb3}>
            <label htmlFor="location" className={styles.formLabel}>Event Location:</label>
            <input
              type="text"
              className={styles.formControl}
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <div className={styles.mb3}>
            <label htmlFor="organizer" className={styles.formLabel}>Organizer Name:</label>
            <input
              type="text"
              className={styles.formControl}
              id="organizer"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
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

export default AdminAddEvent;
