import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../style/AttendingEvents.module.css';

function AttendingEvents() {
  const [auth, setAuth] = useState(false);
  const [name, setName] = useState('');
  const [attendedEvents, setAttendedEvents] = useState([]);
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  useEffect(() => {
    axios.get('http://localhost:8081/attending')
      .then((response) => {
        if (response.data.Status === "Success") {
          setAuth(true);
          setName(response.data.name);
          setAttendedEvents(response.data.attendedEvents);
        } else {
          setAuth(false);
          setName('');
          setAttendedEvents([]);
          navigate('/login');
        }
      })
      .catch((error) => {
        console.log(error);
        setAuth(false);
        setName('');
        setAttendedEvents([]);
        navigate('/login'); 
      });
  }, [navigate]);

  const handleRemoveAttendance = (eventId) => {
    axios.delete('http://localhost:8081/remove-attendance', {
      data: {
        eventId: eventId
      }
    })
      .then((response) => {
        if (response.data.Status === "Success") {
          
          setAttendedEvents(attendedEvents.filter(event => event.id !== eventId));
        } else {
          console.error('Error removing attendance:', response.data.error);
        }
      })
      .catch((error) => {
        console.error('Error removing attendance:', error);
      });
  };

  return (
    <div className={styles.content}>
      <div className={styles.container}>
        {auth ? (
          <>
            <h3>Welcome {name}</h3>
            <h3>Your Attending Events</h3>
            <div className={styles.eventsList}>
              {attendedEvents.map((event) => (
                <div key={event.id} className={styles.eventCard}>
                  <div className={styles.eventCardContent}>
                    <h4>{event.name}</h4>
                    <p>{event.description}</p>
                    <p>Date: {event.date}</p>
                    <p>Location: {event.location}</p>
                  </div>
                  <div className={styles.buttonContainer}>
                    <button className={styles.button} onClick={() => handleRemoveAttendance(event.id)}>
                      Remove Attendance
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div>
            <h3>You are not logged in.</h3>
            <h3>Login Now</h3>
            <Link to="/login" className='btn btn-primary'>Login</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendingEvents;
