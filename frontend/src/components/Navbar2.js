import React from 'react';
import { Link } from 'react-router-dom';
import "./Navbar.css";
import { useState} from 'react';
import axios from 'axios';

const handleLogout = () => {
    axios.get('http://localhost:8081/logout')
    .then(res =>{
        window.location.reload(true)
    }).catch(err => console.log(err));
  };

const Navbar2 = () => {
  return (
    <div className="navbar">
      <ul>
        <li>
          <Link to="/admin">Main Page</Link>
        </li>
        <li>
          <Link to="/admin/add-event">Add Event</Link>
        </li>
        <li>
          <Link to="/admin/add-user">Add User</Link>
        </li>
        <li>
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </li>
      </ul>
    </div>
  );
};

export default Navbar2;