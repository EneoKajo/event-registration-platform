import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../style/AdminPage.module.css';

function Admin() {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [adminName, setAdminName] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [auth, setAuth] = useState(false);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        const response = await axios.get('http://localhost:8081/admin');
        if (response.data.Status === "Success") {
          setAuth(true);
        } else {
          setAuth(false);
          setError('You are not authorized to access this page');
          navigate('/login'); // Redirect to login if not authenticated
        }
      } catch (error) {
        console.log(error);
        setAuth(false);
        setError('Failed to load data');
        navigate('/login'); // Redirect to login on error
      }
    };

    const fetchData = async () => {
      try {
        const eventsResponse = await axios.get('http://localhost:8081/admin/events');
        if (eventsResponse.data.Status === "Success") {
          setAdminName(eventsResponse.data.adminName);
          setEvents(eventsResponse.data.events);
        }

        const usersResponse = await axios.get('http://localhost:8081/admin/users');
        if (usersResponse.data.Status === "Success") {
          setUsers(usersResponse.data.users);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setError('Failed to load admin data');
        navigate('/login'); // Redirect to login on error
      }
    };

    fetchAuthStatus().then(() => {
      if (auth) {
        fetchData();
      }
    });
  }, [navigate, auth]);

  const handleDeleteEvent = (eventId) => {
    axios.delete(`http://localhost:8081/delete-event/${eventId}`)
      .then((response) => {
        if (response.data.Status === "Success") {
          
          setEvents(events.filter(event => event.id !== eventId));
        } else {
          console.error('Error deleting event:', response.data.Error);
        }
      })
      .catch((error) => {
        console.error('Error deleting event:', error);
      });
  };

  const handleDeleteUser = (userId) => {
    axios.delete(`http://localhost:8081/admin/users/${userId}`)
      .then((response) => {
        if (response.data.Status === "Success") {
  
          setUsers(users.filter(user => user.id !== userId));
        } else {
          console.error('Error deleting user:', response.data.Error);
        }
      })
      .catch((error) => {
        console.error('Error deleting user:', error);
      });
  };

  if (!auth) {
    return (
      <div className={styles.content}>
        <div className={styles.container}>
          <h3>{error || 'Loading...'}</h3>
          <Link to="/login" className={`${styles.btn} ${styles.btnPrimary}`}>Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className={styles.admintitle}>Admin ({adminName})</h1>
      <div className={styles.adminContainer}>
        <div className={styles.eventSection}>
          <h2>Events</h2>
          {events.map(event => (
            <div key={event.id} className={styles.content}>
              <p>{event.name}</p>
              <div className={styles.buttonContainer}>
                <button className={styles.button} onClick={() => navigate(`/admin/edit-event/${event.id}`, { state: event })}>Edit</button>
                <button className={styles.button} onClick={() => navigate(`/admin/attendees/${event.id}`, { state: event })}>Attendees</button>
                <button className={styles.button} onClick={() => handleDeleteEvent(event.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.userSection}>
          <h2>Users</h2>
          {users.map(user => (
            <div key={user.id} className={styles.content}>
              <p>{user.name} - {user.email}</p>
              <div className={styles.buttonContainer}>
                <button className={styles.button} onClick={() => navigate(`/admin/users/${user.id}`)}>Edit</button>
                <button className={styles.button} onClick={() => handleDeleteUser(user.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Admin;
