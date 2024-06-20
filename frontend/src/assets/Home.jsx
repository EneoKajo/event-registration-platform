import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import styles from "../style/Home.module.css";

function Home() {
  const [auth, setAuth] = useState(false);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  axios.defaults.withCredentials = true;

  useEffect(() => {
    axios.get('http://localhost:8081/events')
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
  }, []);

  const handleDelete = (eventId) => {
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

  if (!auth) {
    return (
      <div className={styles.content}>
        <div className={styles.container + ' mt-4'}> 
          <h3>{message}</h3>
          <h3>Login Now</h3>
          <Link to="/login" className='btn btn-primary'>Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.content}>
      <div className={styles.container + ' mt-4'}> 
        <h3>Welcome {name}</h3>
        <h3>Your events</h3>
        <div className={styles.eventsList}> 
          {events.map((event) => (
            <div key={event.id} className={styles.eventCard}> 
              <h4>{event.name}</h4>
              <p>{event.description}</p>
              <p>Date: {event.date}</p>
              <p>Location: {event.location}</p>
              <div className={styles.buttonContainer}> 
                <button className={styles.button} onClick={() => navigate(`/edit-event/${event.id}`, { state: event })}>
                  Edit
                </button>
                <button className={styles.button} onClick={()=> navigate(`/attendees/${event.id}`,{state:event})}>Attendees</button>
                <button className={styles.button} onClick={() => handleDelete(event.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;