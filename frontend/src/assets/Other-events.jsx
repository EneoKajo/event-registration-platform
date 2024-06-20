import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import styles from "../style/OtherEvents.module.css";

function OtherEvents() {
  const [auth, setAuth] = useState(false);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [events, setEvents] = useState([]);
  const [attendedEvents, setAttendedEvents] = useState([]);
  const navigate = useNavigate();
  axios.defaults.withCredentials = true;

  useEffect(() => {
    axios.get('http://localhost:8081/other-events')
      .then((response) => {
        if (response.data.Status === "Success") {
          setAuth(true);
          setName(response.data.name);
          setEvents(response.data.events);
        } else {
          setAuth(false);
          setMessage(response.data.error);
          navigate('/login'); 
        }
      })
      .catch((error) => {
        console.log(error);
        setAuth(false);
        setMessage('Failed to load data');
        navigate('/login');
      });

    // Fetch attended events
    axios.get('http://localhost:8081/attended-events')
      .then((response) => {
        if (response.data.Status === "Success") {
          setAttendedEvents(response.data.attendedEvents);
        } else {
          console.error('Error fetching attended events:', response.data.error);
        }
      })
      .catch((error) => {
        console.error('Error fetching attended events:', error);
      });
  }, []);

  const handleAttend = (eventId) => {
    axios.post(`http://localhost:8081/attend/${eventId}`)
      .then((response) => {
        if (response.data.Status === "Success") {
          
          setAttendedEvents([...attendedEvents, eventId]);
        } else {
          console.error('Error attending event:', response.data.error);
        }
      })
      .catch((error) => {
        console.error('Error attending event:', error);
      });
  };

  return (
    <div className={styles.content}>
      <div className={styles.container}>
        {
          auth ? (
            <div>
              <h3>Welcome {name}</h3>
              <h3>Other Events</h3>
              <div className={styles.eventsList}>
                {events.map((event) => (
                  <div key={event.id} className={styles.eventCard}>
                    <h4>{event.name}</h4>
                    <p>{event.description}</p>
                    <p>Date: {event.date}</p>
                    <p>Location: {event.location}</p>
                    <div className={styles.buttonContainer}>
                      {
                        attendedEvents.includes(event.id) ? (
                          <button className={`${styles.button} ${styles.attended}`} disabled>
                            ✔ Attending
                          </button>
                        ) : (
                          <button className={styles.button} onClick={() => handleAttend(event.id)}>
                            Attend
                          </button>
                        )
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h3>{message}</h3>
              <h3>Login Now</h3>
              <Link to="/login" className='btn btn-primary'>Login</Link>
            </div>
          )
        }
      </div>
    </div>
  );
}

export default OtherEvents;
