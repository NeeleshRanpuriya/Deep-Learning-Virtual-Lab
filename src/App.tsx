import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Unit1Page from './pages/Unit1Page'
import Unit2Page from './pages/Unit2Page'
import Unit3Page from './pages/Unit3Page'
import Unit4Page from './pages/Unit4Page'
import Unit5Page from './pages/Unit5Page'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="unit1" element={<Unit1Page />} />
        <Route path="unit2" element={<Unit2Page />} />
        <Route path="unit3" element={<Unit3Page />} />
        <Route path="unit4" element={<Unit4Page />} />
        <Route path="unit5" element={<Unit5Page />} />
      </Route>
    </Routes>
  )
}
