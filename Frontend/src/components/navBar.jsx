import React from 'react'
import { PlusIcon } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';

const NavBar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <header className="bg-base-300 border-b border-base-content/10">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-mono tracking-tight text-base-content">
            <Link to={token ? '/home' : '/'}>Kurripu</Link>
          </h1>
          <div className="flex items-center gap-4">
            {token && (
              <>
                <Link to="/create" className="btn btn-soft rounded-full btn-primary flex items-center gap-2">
                  <PlusIcon className="h-5 w-5" />
                  <span>New Note</span>
                </Link>
                <button onClick={handleLogout} className="btn btn-ghost rounded-full">Logout</button>
              </>
            )}
            {!token && (
              <>
                <div className="divider divider-horizontal h-6"></div>
                <Link to="/login" className="btn btn-ghost rounded-full">Login</Link>
                <Link to="/signup" className="btn btn-outline rounded-full">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default NavBar
