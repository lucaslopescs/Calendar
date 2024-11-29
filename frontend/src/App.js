import React, { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false); // Toggle for register page

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (!user) {
    return showRegister ? (
      <Register />
    ) : (
      <div>
        <Login setUser={setUser} />
        <p>
          Don't have an account?{' '}
          <button onClick={() => setShowRegister(true)}>Register</button>
        </p>
      </div>
    );
  }

  return (
    <div className="App">
      <header>
        <h1>School Event Manager</h1>
        <div>
          <span>Welcome, {user.email}</span>
          <button onClick={logout} style={{ marginLeft: '10px' }}>
            Logout
          </button>
        </div>
      </header>
      <main>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={[]} // Replace with your event-fetching logic
        />
      </main>
    </div>
  );
}

export default App;