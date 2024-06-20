import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from '../style/Attendees.module.css';

function Attendees() {
  const { id: eventId } = useParams();
  const [attendees, setAttendees] = useState([]);
  const [eventName, setEventName] = useState('');
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  axios.defaults.withCredentials = true;

  useEffect(() => {
    axios.get('http://localhost:8081/events')
      .then((response) => {
        if (response.data.Status === "Success") {
          setAuth(true);
        } else {
          setAuth(false);
          setMessage('You are not authorized to access this page');
          navigate('/login'); 
        }
      })
      .catch((error) => {
        console.log(error);
        setAuth(false);
        setMessage('Failed to load data');
        navigate('/login'); 
      });

    axios.get(`http://localhost:8081/attendees/${eventId}`)
      .then(response => {
        if (response.data.Status === "Success") {
          console.log('Attendees:', response.data.attendees); 
          setAttendees(response.data.attendees);
          setEventName(response.data.eventName);
        } else {
          console.error('Error fetching attendees:', response.data.Error);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching attendees:', error);
        setLoading(false);
      });
  }, [eventId]);

  const handleRemoveAttendee = (userName, eventId) => {
    const attendeeToRemove = attendees.find((attendee) => attendee.userName === userName);

    if (!attendeeToRemove) {
      console.error('Attendee not found');
      return;
    }

    axios.delete(`http://localhost:8081/remove-attendee`, {
      data: {
        userName,
        eventId,
      },
    })
      .then((response) => {
        if (response.data.Status === "Success") {
          
          setAttendees((prevAttendees) =>
            prevAttendees.filter((attendee) => attendee.userName !== userName)
          );
         
        } else {
          console.error('Error removing attendee:', response.data.Error);
          
        }
      })
      .catch((error) => {
        console.error('Error removing attendee:', error);
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.content}>
      <div className={styles.tableContainer}>
        {
          auth ? (
            <>
              <h2>Attendees for {eventName}</h2>
              <table className={styles.attendeesTable}>
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((attendee) => (
                    <tr key={attendee.userId}>
                      <td>{attendee.userName}</td>
                      <td>
                        <button
                          className={styles.removeButton}
                          onClick={() => handleRemoveAttendee(attendee.userName, eventId)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
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

export default Attendees;
