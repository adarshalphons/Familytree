'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import TreeView from '../components/FamilyTree/TreeView'
import LoginForm from '../components/Auth/LoginForm'
import styles from '../styles/Family.module.css'
import { useRouter } from 'next/navigation'
import Loader from '../components/FamilyTree/Loader'

export default function Admin() {
  const { user, loading, logout } = useAuth()
  const [treeData, setTreeData] = useState(null)
  const [error, setError] = useState(null)
  const router = useRouter()

  // Wrap all your fetch calls in try-catch blocks
const fetchTreeData = async () => {
  try {
    const res = await fetch('/api/family')
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error('Fetch error:', error)
    throw error // Re-throw to be caught by the calling function
  }
}

// Then use it in your useEffect:
useEffect(() => {
  const loadData = async () => {
    try {
      const data = await fetchTreeData()
      setTreeData(data)
    } catch (error) {
      setError('Failed to load family tree')
    }
  }
  loadData()
}, [])

  if (loading) {
    return <Loader isLoading={loading} />
  }

  if (!user) {
    return <LoginForm redirectPath="/admin" />
  }

 

  return (
    <main>
      {/* <div className={styles.adminHeader}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div> */}
      
      {treeData ? (
        <TreeView treeData={treeData} isAdmin={true} />
      ) : (
        <Loader isLoading={!treeData} />
      )}
    </main>
  )
}