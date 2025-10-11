import './App.css'
import React , { useState, useEffect} from 'react'
import axios from 'axios'

function App() {

  const [message, setMessage] = useState('')
  
  useEffect(() => { 
    axios.get('http://127.0.0.1:8000/')
      .then(response => {
        setMessage(response.data.message)
      })
      .catch(error => {
        console.error('There was an error fetching the message!', error)
      })
  }, [])

  return (
    <>
      <h1>Hello World!</h1>
      <p>Api Response: </p>
      <p>{message}</p>
      
    </>
  )
}

export default App
