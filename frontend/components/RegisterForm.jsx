import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok) {
        login(); // Update auth state
        // Redirect or show success message
      } else {
        // Handle error
        console.error(data.error);
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleGoogleLogin = async () => {
    // Implement Google OAuth flow here
    // You'll need to add Google OAuth library and handle the flow
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
      />
      <button type="submit">Register</button>
      <button type="button" onClick={handleGoogleLogin}>
        Sign up with Google
      </button>
    </form>
  );
} 