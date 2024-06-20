import React from "react";
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './Home'
import Register from "./Register";
import Login from "./Login";
import Navbar from "../components/Navbar";
import Navbar2 from "../components/Navbar2";
import OtherEvents from "./Other-events";
import AddEvent from "./AddEvent";
import EditEvent from "./EditEvent";
import Attendees  from "./Attendees";
import AttendingEvents from "./AttendingEvents";
import Admin from "./AdminPage";
import AdminEditEvent from "./AdminEditEvent";
import AdminAttendees from "./AdminAttednees";
import AdminEditUser from "./AdminEditUser";
import AdminAddEvent from "./AdminAddEvent";
import AddUser from "./AdminAddUser";

function App(){
  return(
    <BrowserRouter>
    <Routes>
     <Route path='/' element={<><Navbar /><Home/></>}></Route>
     <Route path='/admin' element ={<><Navbar2/><Admin/></>}></Route>
     <Route path='/admin/edit-event/:id' element={<><Navbar2/><AdminEditEvent from="/admin" /></>}></Route>
     <Route path='/admin/attendees/:id' element={<><Navbar2/><AdminAttendees from="/admin" /></>}></Route>
     <Route path='/admin/users/:id' element={<><Navbar2/><AdminEditUser from="/admin" /></>}></Route>
     <Route path='/admin/add-event' element={<><Navbar2/><AdminAddEvent from="/admin" /></>}></Route>
     <Route path='/admin/add-user' element={<><Navbar2/><AddUser from="/admin" /></>}></Route>
     <Route path='/register' element={<Register/>}></Route>
     <Route path='/login' element ={<Login/>}></Route>
     <Route path='/other-events' element={<><Navbar /><OtherEvents/></>}></Route>
     <Route path='/add-event' element={<><Navbar /><AddEvent/></>}></Route>
     <Route path="/edit-event/:id" element={<><Navbar /><EditEvent /></>} />
     <Route path="/attendees/:id" element={<><Navbar /><Attendees /></>} />
     <Route path="/attending" element={<><Navbar /><AttendingEvents /></>} />

      
    </Routes>
    </BrowserRouter>

  )
}

export default App