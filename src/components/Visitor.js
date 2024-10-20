"use client"

import React, { useState, useRef } from 'react'

export default function Visitor({ user }) {
  const [isRinging, setIsRinging] = useState(false)
  const [isLeavingMessage, setIsLeavingMessage] = useState(false)
  const [name, setName] = useState(user.name ?? '')
  const [message, setMessage] = useState('')
  const [confirmationMessage, setConfirmationMessage] = useState('')
  const audioContext = useRef(null)

  const playDoorbellSound = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)()
    }

    const ctx = audioContext.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'sine'

    // First tone
    oscillator.frequency.setValueAtTime(880, ctx.currentTime) // A5
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.01)
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5)

    // Second tone
    oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.7) // E5
    gainNode.gain.setValueAtTime(0, ctx.currentTime + 0.7)
    gainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.71)
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 1.2)
  }

  const handleRingDoorbell = () => {
    setIsRinging(true)
    playDoorbellSound()
    setTimeout(() => setIsRinging(false), 3000) // Reset after 3 seconds
  }

  const handleSubmitMessage = (e) => {
    e.preventDefault()
    setConfirmationMessage(`Thank you, ${name}. Your message has been sent.`)
    setIsLeavingMessage(false)
    setName('')
    setMessage('')
    setTimeout(() => setConfirmationMessage(''), 3000) // Clear confirmation after 3 seconds
  }

  return (
    <div className="min-h-screen flex flex-col ">

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <div>
            <span className="text-center">Welcome! How can we help you today?</span>
          </div>
          <div className="gap-y-4">
            {isRinging ? (
              <span className="text-center text-green-600 font-medium">
                Doorbell is ringing. The homeowner will be notified.
              </span>
            ) : (
              <button
                className="w-full h-24 text-2xl flex items-center justify-center space-x-2"
                onClick={handleRingDoorbell}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5" />
                </svg>
                <span>Ring Doorbell</span>
              </button>
            )}

            {!isLeavingMessage && !isRinging && (
              <button className="w-full" variant="outline" onClick={() => setIsLeavingMessage(true)}>
                Leave a Message
              </button>
            )}

            {isLeavingMessage && (
              <form onSubmit={handleSubmitMessage} className="flex flex-col gap-4 px-2 py-4 rounded-md items-stretch">
                <div className="flex gap-2 flex-col">
                  <label htmlFor="name">Your Name</label>
                  <input
                    className='py-2 px-4 rounded text-black'
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-2 flex-col">
                  <label htmlFor="message">Your Message</label>
                  <textarea
                    className='py-2 px-4 rounded text-black'
                    id="message"
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="w-full">Send Message</button>
              </form>
            )}

            {confirmationMessage && (
              <p className="text-center text-green-600 font-medium">{confirmationMessage}</p>
            )}
          </div>
        </div>
      </main>

    </div>
  )
}