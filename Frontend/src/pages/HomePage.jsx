import React, { useState } from 'react'
import NavBar from '../components/navBar.jsx'
import RateLimitedUI from '../components/RateLimitedUI.jsx';
import { useEffect } from 'react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import NoteCard from '../components/NoteCard.jsx';

const HomePage = () => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchNotes = async () => {
      try{
        const res = await api.get('/notes');
        console.log(res.data);
        setNotes(res.data || []);
        setIsRateLimited(false);
      }
      catch(error){
        console.log("Error fetching notes:", error);
        if(error.response?.status === 429){
          setIsRateLimited(true);
        }
        else{
          if(error.response?.status === 401){
            toast.error('Please login to see your notes');
          } else {
          toast.error("Failed to fetch notes.");
          }
        }
      }
      finally{
        setLoading(false);
      }
    }
    fetchNotes();
  }, []);
  return (
    <div className="min-h-screen">
      <NavBar />

      {isRateLimited && <RateLimitedUI />}
      <div className = "max-w-7xl mx-auto p-4 mt-6">
        {loading && <div className = "text-center text-warning py-10">Loading notes...</div>}
        {notes.length > 0 && !isRateLimited && (
          <div className='justify grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mx-auto'>
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} setNotes={setNotes} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage