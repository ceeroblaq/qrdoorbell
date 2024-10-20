"use client"

import React, { useRef, useState } from 'react'
import Link from 'next/link'
import ReactLoading from 'react-loading';
import {generateQRFor} from '../helpers/helpers'
import { createResidence, getQRDownloadURL } from '../helpers/firebaseConfig';

export default function Owner({ user }) {
  const homeownerName = user.name // This would typically come from a prop or context
  const homeRef = useRef(null)
  const [name, setName] = useState(`${user.name}'s Residence` ?? '')
  const notificationsRef = useRef(null)
  const messagesRef = useRef(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [qrlink, setQRLink] = useState(user.owner.qrcode ?? '')
  const [waiting, setWaiting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
    setIsMenuOpen(false)
  }

  const MenuItems = () => (
    <>
      <button onClick={() => scrollToSection(homeRef)} className="text-gray-900 hover:bg-gray-50 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Home</button>
      <button onClick={() => scrollToSection(notificationsRef)} className="text-gray-900 hover:bg-gray-50 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Notifications</button>
      <button onClick={() => scrollToSection(messagesRef)} className="text-gray-900 hover:bg-gray-50 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Messages</button>
    </>
  )
  const handleQR = async () => {
    setWaiting(true)
    const id = await createResidence(name, '', user.uid)
    const link = await generateQRFor(id)
    setQRLink(link)
    setWaiting(false)
  }
  const handleQRSave = async () => {
    setWaiting(true)
    const url = await getQRDownloadURL(user.owner.id)

    // Create a link element and trigger the download
    const link = document.createElement("a");
    link.href = url; // a URL for the blob
    link.download = `DoorBell QR Code for ${user.owner.name.trim()}.png`; // The name of the downloaded file
    document.body.appendChild(link);
    link.click(); // Programmatically click the link to trigger the download
    document.body.removeChild(link); // Clean up the DOM
    setWaiting(false)
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-800">


      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div ref={homeRef} className="mb-12">
          <h1 className="text-3xl font-bold text-gray-100 mb-8">Welcome back, {homeownerName}!</h1>

          <div>
            <div className='flex flex-col w-full items-center justify-center gap-1'>
              {qrlink ?

                <div className={`flex flex-col py-2  px-2 justify-center min-w-fit gap-2 items-center bg-orange-200 text-black border border-red-900 rounded`}>
                  <img alt='qrcode' src={qrlink} className={`w-32 h-32 object-cover object-center rounded border bg-slate-500`} loading='lazy' />
                  <button className='flex flex-col bg-white/70 items-center justify-center w-full py-1 rounded hover:bg-white'
                    disabled={waiting}
                    onClick={() => {
                      handleQRSave()
                    }}>
                    {waiting ? <ReactLoading height={'32px'} width={'32px'} type="bubbles" color="black" /> :
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 12l3 3m0 0 3-3m-3 3V2.25" />
                      </svg>
                    }
                    <span className='font-light text-xs'>Download</span>
                  </button>
                </div>
                :
                <div className='flex p-4 gap-2 flex-col border rounded'>
                  <div className="flex gap-1 flex-col">
                    <span htmlFor="name" className='text-xs'>Residence Name</span>
                    <input
                      className='py-2 px-4 rounded text-black text-sm'
                      id="name"
                      placeholder="Enter your residence name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <button className={`flex justify-center gap-2 items-center bg-orange-200 disabled:bg-gray-300 text-black border border-red-900 rounded px-3`}
                  disabled={name == ''}
                    onClick={() => {
                      handleQR()
                    }}>
                    <span className='font-semibold text-xs py-2'>{waiting ? 'Generating..' : 'Generate QR Code'}</span>
                    {waiting && <ReactLoading height={'32px'} width={'32px'} type="bubbles" color="black" />}
                  </button>
                </div>
              }
            </div>
          </div>
        </div>

        <div ref={notificationsRef} className="mb-12">
          <div>
            <div>
              <span>Recent Notifications</span>
            </div>
            <div>
              <ul className="space-y-4">
                {[
                  { visitor: "John Smith", action: "rang the doorbell", date: "2023-06-15 14:30" },
                  { visitor: "Delivery Person", action: "left a package", date: "2023-06-14 11:15" },
                  { visitor: "Jane Doe", action: "visited", date: "2023-06-13 16:45" },
                ].map((notification, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{notification.visitor} {notification.action}</p>
                      <p className="text-xs text-gray-500">{notification.date}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div ref={messagesRef}>
          <div>
            <div>
              <span>Messages</span>
            </div>
            <div>
              <ul className="space-y-4">
                {[
                  { company: "Amazon", message: "Your package has been delivered." },
                  { company: "Neighbor", message: "Can you please move your car?" },
                  { company: "Plumber", message: "I'll be there tomorrow at 10 AM." },
                ].map((message, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-500 mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                    </svg>

                    <div className="flex-grow">
                      <p className="text-sm font-medium text-gray-900">Delivery from {message.company}</p>
                      <p className="text-sm text-gray-500">{message.message}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}