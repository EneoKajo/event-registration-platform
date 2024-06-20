import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';



const salt = 10;

const app = express();
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000'],
  methods:['POST', 'GET', 'DELETE', 'PUT'],
  credentials:true
}));
app.use(cookieParser());

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password:'Tirana2024!',
  database:'event_registration'
});

// Middleware function to verify user authentication
const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ Error: "You are not authenticated" });
  } else {
    jwt.verify(token, "jwt-secret-key", (err, decoded) => {
      if (err) {
        return res.status(401).json({ Error: "Token is not valid" });
      } else {
        req.userId = decoded.userId;
        req.name = decoded.name;
        req.role = decoded.role;

        next();
      }
    });
  }
};


// Register users
app.post('/register', (req, res) => {
  const sql = "INSERT INTO event_registration.users (name, email, password) VALUES (?, ?, ?)";
  bcrypt.hash(req.body.password.toString(), salt, (err, hash) => {
    if (err) return res.json({ Error: "Error for hashing password" });
    const values = [
      req.body.name,
      req.body.email,
      hash
    ];
    db.query(sql, values, (err, result) => {
      if (err) return res.json({ Error: "Inserting data Error in server" });
      return res.json({ Status: "Success" });
    });
  });
});

// Login user
app.post('/login',(req, res)=>{
  const sql = 'SELECT * FROM event_registration.users WHERE email =?';
  db.query(sql,[req.body.email],(err, data)=>{
    if(err) return res.json({Error:"Login error in server"});
    if(data.length >0){
      bcrypt.compare(req.body.password.toString(), data[0].password, (err, response)=>{
        if(err) return res.json({Error:"Error in password comparison"});
        if(response){
          // token
          const userId = data[0].id;
          const name = data[0].name;
          const role = data[0].role; // Get the role from the database
          const token = jwt.sign({ userId, name, role }, "jwt-secret-key", { expiresIn: '1d' });
          res.cookie('token', token, {secure:true, httpOnly: true});
          return res.json({Status:"Success", role: role});
        }else{
          return res.json({Error:"Password no matched"});
        }
      })

    }else{
      return res.json({Error:"No email existed"});
    }

  })

})
// Logout function
app.get('/logout',(req, res)=>{
  res.clearCookie('token');
  return res.json({Status:'Success'});
})

// Route handler to retrieve events for the logged-in user
app.get('/events', verifyUser, (req, res) => {
  const userId = req.userId;
  const sql = 'SELECT * FROM event_registration.events WHERE organizer_id =? ORDER BY date DESC';
  db.query(sql, [userId], (err, rows) => {
    if (err) {
      return res.json({ Error: "Error fetching events" });
    }
    const events = rows.map((event) => ({
      id: event.id,
      name: event.name,
      description: event.description,
      date: event.date,
      location: event.location,
    }));
    return res.json({ Status: "Success", name: req.name, events });
  });
});

// Route handler to retrieve other events for the logged-in user
app.get('/other-events', verifyUser, (req, res) => {
    console.log('Other events route handler called');
    const userId = req.userId;
    const sql = 'SELECT * FROM event_registration.events WHERE organizer_id!=? ORDER BY date DESC';
    db.query(sql, [userId], (err, rows) => {
      if (err) {
        console.error('Error fetching events:', err);
        return res.json({ Error: "Error fetching events" });
      }
      const events = rows.map((event) => ({
        id: event.id,
        name: event.name,
        description: event.description,
        date: event.date,
        location: event.location,
      }));
      console.log('Events:', events);
      return res.json({ Status: "Success", name: req.name, events });
    });
  });

//Add event for the loged in user
app.post('/add-event', verifyUser, (req, res) => {
    const { name, description, date, location } = req.body;
    const organizerId = req.userId; 
    
    const sql = "INSERT INTO events (name, description, date, location, organizer_id) VALUES (?, ?, ?, ?, ?)";
    
    db.query(sql, [name, description, date, location, organizerId], (err, result) => {
      if (err) {
        console.error('Error inserting event:', err);
        return res.json({ Status: "Error", Error: "Error inserting event in server" });
      }
      return res.json({ Status: "Success" });
    });
  });

  // Route handler to retrieve event details for the edit event placeholder
  app.get('/event/:id', verifyUser, (req, res) => {
    const eventId = req.params.id;
    const sql = 'SELECT * FROM event_registration.events WHERE id = ?';
    
    db.query(sql, [eventId], (err, rows) => {
      if (err) {
        console.error('Error fetching event:', err);
        return res.json({ Error: "Error fetching event" });
      }
      if (rows.length === 0) {
        return res.json({ Error: "Event not found" });
      }
      const event = rows[0];
      return res.json({ Status: "Success", event });
    });
  });
  


// Update event POST
app.post('/edit-event/:id', verifyUser, (req, res) => {
  const eventId = req.params.id;
  const { name, description, date, location } = req.body;
  const sql = 'UPDATE event_registration.events SET name = ?, description = ?, date = ?, location = ? WHERE id = ?';

  db.query(sql, [name, description, date, location, eventId], (err, results) => {
    if (err) {
      console.error('Error updating event:', err);
      return res.status(500).json({ Status: "Error", Error: "Error updating event" });
    } else {
      return res.json({ Status: "Success" });
    }
  });
});
// Delete event function
app.delete('/delete-event/:id', verifyUser, (req, res) => {
  const eventId = req.params.id;
  const sql = 'DELETE FROM event_registration.events WHERE id = ? AND organizer_id = ?';

  db.query(sql, [eventId, req.userId], (err, result) => {
    if (err) {
      console.error('Error deleting event:', err);
      return res.json({ Status: "Error", Error: "Error deleting event" });
    }
    return res.json({ Status: "Success" });
  });
});

//Get attendee list 
app.get('/attendees/:id', verifyUser, (req, res) => {
  const eventId = req.params.id;
  const sql = `
    SELECT e.name AS eventName, u.name AS userName
    FROM event_registration.attendees a
    JOIN event_registration.users u ON a.user_id = u.id
    JOIN event_registration.events e ON a.event_id = e.id
    WHERE a.event_id = ?
  `;
  db.query(sql, [eventId], (err, rows) => {
    if (err) {
      console.error('Error fetching event:', err);
      return res.json({ Error: "Error fetching event" });
    }
    if (rows.length === 0) {
      return res.json({ Error: "Event not found" });
    }
    const attendees = rows; 
    return res.json({ Status: "Success", eventName: rows[0].eventName, attendees });
  });
});

// Remove attendee
app.delete('/remove-attendee', verifyUser, (req, res) => {
  const { userName, eventId } = req.body;
  // Retrieve userId based on userName
  const getUserIdSql = 'SELECT id FROM event_registration.users WHERE name = ?';
  db.query(getUserIdSql, [userName], (err, rows) => {
    if (err) {
      console.error('Error fetching user ID:', err);
      return res.status(500).json({ Error: "Error fetching user ID from database." });
    }
    if (rows.length === 0) {
      console.error('User not found');
      return res.status(404).json({ Error: "User not found." });
    }
    const userId = rows[0].id;

    // Perform DELETE operation on attendees table
    const deleteSql = 'DELETE FROM event_registration.attendees WHERE user_id = ? AND event_id = ?';
    db.query(deleteSql, [userId, eventId], (err, result) => {
      if (err) {
        console.error('Error removing attendee:', err);
        return res.status(500).json({ Error: "Error removing attendee from database." });
      }

      console.log(`Attendee with user_id ${userId} removed from event ${eventId}`);
      return res.json({ Status: "Success" });
    });
  });
});

// Attend event handler
app.post('/attend/:eventId', verifyUser, (req, res) => {
  const eventId = req.params.eventId;
  const userId = req.userId; // Ensure you have req.userId set properly in verifyUser middleware
  
  const sql = "INSERT INTO event_registration.attendees (user_id, event_id) VALUES (?, ?)";
  
  db.query(sql, [userId, eventId], (err, result) => {
    if (err) {
      console.error('Error inserting attendee:', err);
      return res.json({ Status: "Error", Error: "Error inserting attendee in server" });
    }
    res.json({ Status: "Success" });
  });
});

app.get('/verify-user', verifyUser, (req, res) => {
  if (req.userId) {
    return res.json({ Status: "Success", userId: req.userId });
  } else {
    return res.json({ Status: "Error", Error: "User not authenticated" });
  }
});

// Fetch attended events for the logged-in user
app.get('/attended-events', verifyUser, (req, res) => {
  const userId = req.userId;
  const sql = `
    SELECT event_id
    FROM event_registration.attendees
    WHERE user_id = ?
  `;
  db.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error('Error fetching attended events:', err);
      return res.json({ Error: "Error fetching attended events" });
    }
    const attendedEvents = rows.map(row => row.event_id);
    return res.json({ Status: "Success", attendedEvents });
  });
});
//attending
app.get('/attending', verifyUser, (req, res) => {
  const userId = req.userId;
  const sql = `
    SELECT e.id, e.name, e.description, e.date, e.location
    FROM event_registration.attendees a
    JOIN event_registration.events e ON a.event_id = e.id
    WHERE a.user_id = ?
  `;
  db.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error('Error fetching attended events:', err);
      return res.json({ Error: "Error fetching attended events" });
    }
    const attendedEvents = rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      date: row.date,
      location: row.location
    }));
    return res.json({ Status: "Success", attendedEvents });
  });
});


//Remove attendance
app.delete('/remove-attendance', verifyUser, (req, res) => {
  const eventId = req.body.eventId;
  const userId = req.userId;

  const deleteSql = 'DELETE FROM event_registration.attendees WHERE user_id =? AND event_id =?';
  db.query(deleteSql, [userId, eventId], (err, result) => {
    if (err) {
      console.error('Error removing attendance:', err);
      return res.status(500).json({ Error: "Error removing attendance from database." });
    }

    console.log(`User with id ${userId} removed from attendance of event ${eventId}`);
    return res.json({ Status: "Success" });
  });
});

// Admin route
app.get('/admin', verifyUser, (req, res) => {
  if (req.role === 'admin') {
    return res.json({ Status: "Success", role: req.role });
  } else {
    return res.status(403).json({ Status: "Error", Error: "Not authorized as admin" });
  }
});

/// Get All Events for the admin page
app.get('/admin/events', verifyUser, (req, res) => {
  if (req.role === 'admin') {
    const sql = 'SELECT e.id, e.name, e.description, e.date, e.location FROM events e';
    db.query(sql, (err, eventsResult) => {
      if (err) return res.json({ Status: "Error", Error: "Error fetching events" });

      const adminSql = 'SELECT name FROM users WHERE id = ?'; // Replace with your actual query to fetch admin's name
      db.query(adminSql, [req.userId], (adminErr, adminResult) => {
        if (adminErr) return res.json({ Status: "Error", Error: "Error fetching admin name" });

        const adminName = adminResult.length > 0 ? adminResult[0].name : ''; // Assuming you fetch admin name correctly
        return res.json({ Status: "Success", adminName, events: eventsResult });
      });
    });
  } else {
    return res.status(403).json({ Status: "Error", Error: "Not authorized" });
  }
});

// Get event details for placeholdes
app.get('/admin/event/:id', verifyUser, (req, res) => {
  if (req.role === 'admin') {
    const eventId = req.params.id;
    const sql = `
      SELECT e.*, u.name AS organizer
      FROM event_registration.events e
      JOIN users u ON e.organizer_id = u.id
      WHERE e.id = ?
    `;

    db.query(sql, [eventId], (err, rows) => {
      if (err) {
        console.error('Error fetching event:', err);
        return res.json({ Error: "Error fetching event" });
      }
      if (rows.length === 0) {
        return res.json({ Error: "Event not found" });
      }
      const event = rows[0];
      return res.json({ Status: "Success", event });
    });
  } else {
    return res.status(403).json({ Status: "Error", Error: "Not authorized" });
  }
});


// Edit Event
app.post('/admin/edit-event/:id', verifyUser, (req, res) => {
  if (req.role === 'admin') {
    const eventId = req.params.id;
    const { name, description, date, location, organizerName } = req.body;

    // Find the user ID based on the organizer name
    db.query('SELECT id FROM users WHERE name = ?', [organizerName], (err, results) => {
      if (err) {
        console.error('Error finding user:', err);
        return res.status(500).json({ Status: 'Error', Error: 'Error finding user' });
      }

      if (results.length === 0) {
        return res.status(404).json({ Status: 'Error', Error: 'Organizer not found' });
      }

      const organizerId = results[0].id;

      const sql = 'UPDATE event_registration.events SET name = ?, description = ?, date = ?, location = ?, organizer_id = ? WHERE id = ?';
      db.query(sql, [name, description, date, location, organizerId, eventId], (err, results) => {
        if (err) {
          console.error('Error updating event:', err);
          return res.status(500).json({ Status: 'Error', Error: 'Error updating event' });
        } else {
          return res.json({ Status: 'Success' });
        }
      });
    });
  } else {
    return res.status(403).json({ Status: 'Error', Error: 'Not authorized' });
  }
});


//Add Event from the admin site
app.post('/admin/add-event', verifyUser, (req, res) => {
  if (req.role === 'admin') {
    const { name, description, date, location, organizerName } = req.body;


    db.query('SELECT id FROM users WHERE name = ?', [organizerName], (err, results) => {
      if (err) {
        console.error('Error finding user:', err);
        return res.status(500).json({ Status: 'Error', Error: 'Error finding user' });
      }

      if (results.length === 0) {
        return res.status(404).json({ Status: 'Error', Error: 'Organizer not found' });
      }

      const organizerId = results[0].id;


      const sql = 'INSERT INTO event_registration.events (name, description, date, location, organizer_id) VALUES (?, ?, ?, ?, ?)';
      db.query(sql, [name, description, date, location, organizerId], (err, results) => {
        if (err) {
          console.error('Error inserting event:', err);
          return res.status(500).json({ Status: 'Error', Error: 'Error inserting event' });
        } else {
          return res.json({ Status: 'Success' });
        }
      });
    });
  } else {
    return res.status(403).json({ Status: 'Error', Error: 'Not authorized' });
  }
});


// Delete Event
app.delete('/admin/delete-event/:id', verifyUser, (req, res) => {
  if (req.role === 'admin') {
    const eventId = req.params.id;
    const sql = 'DELETE FROM events WHERE id = ?';

    db.query(sql, [eventId], (err, result) => {
      if (err) {
        console.error('Error deleting event:', err);
        return res.json({ Status: "Error", Error: "Error deleting event" });
      }

      return res.json({ Status: "Success" });
    });
  } else {
    return res.status(403).json({ Status: "Error", Error: "Not authorized" });
  }
});

// Get attendee list for the event
app.get('/admin/attendees/:id', verifyUser, (req, res) => {
  if (req.role === 'admin') {
    const eventId = req.params.id;
    const sql = `SELECT e.name AS eventName, u.name AS userName, u.id AS userId 
                 FROM event_registration.attendees a 
                 JOIN event_registration.users u ON a.user_id = u.id 
                 JOIN event_registration.events e ON a.event_id = e.id 
                 WHERE a.event_id = ?`;

    db.query(sql, [eventId], (err, rows) => {
      if (err) {
        console.error('Error fetching event:', err);
        return res.json({ Status: "Error", Error: "Error fetching event" });
      }
      if (rows.length === 0) {
        return res.json({ Status: "Error", Error: "Event not found" });
      }

      const attendees = rows.map((row) => ({
        userId: row.userId,
        userName: row.userName,
      }));

      return res.json({ Status: "Success", eventName: rows[0].eventName, attendees });
    });
  } else {
    return res.status(403).json({ Status: "Error", Error: "Not authorized" });
  }
});

// Get All Users for the admin site
app.get('/admin/users', verifyUser, (req, res) => {
  if (req.role === 'admin') {
    const sql = 'SELECT id, name, email FROM users';
    db.query(sql, (err, result) => {
      if (err) return res.json({ Status: "Error", Error: "Error fetching users" });

      return res.json({ Status: "Success", users: result });
    });
  } else {
    return res.status(403).json({ Status: "Error", Error: "Not authorized" });
  }
});

// Get User information for the placeholders on the edit form
app.get('/admin/users/:id', verifyUser, (req, res) => {
  if (req.role === 'admin') {
    const userId = req.params.id;
    const sql = 'SELECT * FROM users WHERE id = ?';

    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ Status: "Error", Error: "Error fetching user" });
      }
      if (results.length === 0) {
        return res.status(404).json({ Status: "Error", Error: "User not found" });
      }

      const user = results[0];
      bcrypt.compare('', user.password, (err, result) => {
        if (err) {
          console.error('Error decrypting password:', err);
          return res.status(500).json({ Status: "Error", Error: "Error decrypting password" });
        } else {
          user.password = ''; // Set password to empty string for security
          return res.json({ Status: "Success", user });
        }
      });
    });
  } else {
    return res.status(403).json({ Status: "Error", Error: "Not authorized" });
  }
});

// Edit User
app.post('/admin/users/:id', verifyUser, (req, res) => {
  if (req.role === 'admin') {
    const userId = req.params.id;
    const { name, email, password, role } = req.body;

    bcrypt.hash(password.toString(), salt, (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err);
        return res.status(500).json({ Status: "Error", Error: "Error hashing password" });
      } else {
        const sql = 'UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?';
        db.query(sql, [name, email, hash, role, userId], (err, results) => {
          if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ Status: "Error", Error: "Error updating user" });
          } else {
            return res.json({ Status: "Success" });
          }
        });
      }
    });
  } else {
    return res.status(403).json({ Status: "Error", Error: "Not authorized" });
  }
});

// Delete User
app.delete('/admin/users/:id', verifyUser, (req, res) => {
  if (req.role === 'admin') {
    const userId = req.params.id;
    const sql = 'DELETE FROM users WHERE id = ?';

    db.query(sql, [userId], (err, result) => {
      if (err) {
        console.error('Error deleting user:', err);
        return res.json({ Status: "Error", Error: "Error deleting user" });
      }

      return res.json({ Status: "Success" });
    });
  } else {
    return res.status(403).json({ Status: "Error", Error: "Not authorized" });
  }
});

//Add user 
app.post('/admin/add-user', verifyUser, (req, res) => {
  if (req.role === 'admin') {
    const { name, email,  password, role} = req.body;

    // Hash the password before inserting it into the database
    bcrypt.hash(password, salt, (err, hashedPassword) => {
      if (err) {
        console.error('Error hashing password:', err);
        return res.status(500).json({ Status: 'Error', Error: 'Error hashing password' });
      }

      const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
      db.query(sql, [name, email,  hashedPassword, role], (err, results) => {
        if (err) {
          console.error('Error inserting user:', err);
          return res.status(500).json({ Status: 'Error', Error: 'Error inserting user' });
        } else {
          return res.json({ Status: 'Success' });
        }
      });
    });
  } else {
    return res.status(403).json({ Status: 'Error', Error: 'Not authorized' });
  }
});



app.listen(8081, ()=>{
  console.log("Running")
})