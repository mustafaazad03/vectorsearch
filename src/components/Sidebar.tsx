import { Home } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

const Sidebar = () => {
  return (
    <div className='min-h-screen bg-[#0E131B] w-[10%] flex flex-col'>
      <Image src="/logo.svg" className='border-b border-gray-100 w-full object-cover' width={24} height={24} alt='Logo' />
      <div className="p-4 border-l border-blue-500">
        <Home size={24} className='text-blue-500' />
      </div>
    </div>
  )
}

export default Sidebar