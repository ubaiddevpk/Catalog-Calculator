import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const signIn = async () => {
    setLoading(true)
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)
    if (error) alert(error.message)
    else onLogin(data.session)
  }

  const signUp = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    setLoading(false)
    if (error) alert(error.message)
    else alert('Account created! Please login.')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-900">
      <div className="w-96 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md space-y-4">
        <h1 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100">Login / Signup</h1>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          className="w-full bg-black text-white p-2 rounded"
          onClick={signIn}
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
        <button
          className="w-full border p-2 rounded"
          onClick={signUp}
        >
          Signup
        </button>
      </div>
    </div>
  )
}
