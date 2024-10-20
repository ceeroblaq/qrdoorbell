import { SignInButton, UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import React from 'react'

function Header() {
    const { userId } = auth()
    return (
        <div className='flex justify-between items-center px-8 border-b mb-4 py-4 h-20 overflow-hidden'>
            <button className='flex gap-4 items-center justify-between'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5" />
                </svg>
                <span className='font-black text-2xl'>QR Doorbell</span>

            </button>

            {
                userId?
                <UserButton/>
                :
                <SignInButton mode='modal' signUpFallbackRedirectUrl='/'/>
            }
        </div>
    )
}

export default Header