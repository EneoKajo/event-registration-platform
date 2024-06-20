import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import style from '../style/EditEvent.module.css';

function EditEvent() {
  const { id: eventId } = useParams(); 
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const previousLocation = useLocation();

  axios.defaults.withCredentials = true;

  useEffect(() => {
    axios.get('http://localhost:8081/events')
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
  }, [navigate]);

  useEffect(() => {
    if (auth) {
      axios.get(`http://localhost:8081/event/${eventId}`)
        .then(response => {
          if (response.data.Status === "Success") {
            const event = response.data.event;
            setName(event.name);
            setDescription(event.description);
            setDate(event.date);
            setLocation(event.location);
          } else {
            console.error('Error fetching event details:', response.data.Error);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching event details:', error);
          setLoading(false);
        });
    }
  }, [eventId, auth]);

  const handleSubmit = (event) => {
    event.preventDefault();
    axios.post(`http://localhost:8081/edit-event/${eventId}`, {
      name,
      description,
      date,
      location,
    })
     .then((response) => {
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
      })
     .catch((error) => {
        console.error('Error submitting the form:', error);
      });
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
      <h2>Edit Event</h2>
      <div className={style.container}>
        <form onSubmit={handleSubmit}>
          <label className={style.formLabel}>
            Name:
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={style.formControl} />
          </label>
          <br />
          <label className={style.formLabel}>
            Description:
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`${style.formControl} ${style.textarea}`} />
          </label>
          <br />
          <label className={style.formLabel}>
            Date:
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={style.formControl} />
          </label>
          <br />
          <label className={style.formLabel}>
            Location:
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={style.formControl} />
          </label>
          <br />
          <button type="submit" className={`${style.btn} ${style.btnPrimary}`}>Save Changes</button>
          <Link to="/" className={`${style.btn} ${style.btnSecondary} ${style.ms2}`} onClick={(e) => {
  e.preventDefault();
  navigate(-1);
}}>Cancel</Link>
        </form>
      </div>
    </div>
  );
}

export default EditEvent;
