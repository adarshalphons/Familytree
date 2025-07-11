'use client'
import { useEffect, useState } from 'react'
import TreeView from './components/FamilyTree/TreeView'
import styles from './styles/Family.module.css'
import Loader from './components/FamilyTree/Loader'


export default function Home() {
  const [treeData, setTreeData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const res = await fetch('/api/family')
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const data = await res.json()
        setTreeData(data)
      } catch (err) {
        console.error('Failed to fetch tree data:', err)
        setError('Failed to load family tree data')
      }
    }

    fetchTree()
  }, [])

  if (error) {
    return <div className={styles.error}>{error}</div>
  }

  return (
    <main>
      {treeData ? (
        <TreeView treeData={treeData} isAdmin={false} />
      ) : (
       <Loader isLoading={!treeData} />
      )}
    </main>
  )
}