import { auth, clerkClient, getAuth } from '@clerk/nextjs/server'
import Visitor from '../../components/Visitor'
import React from 'react'

const VisitorPage = async () => {
    auth().protect()
    const { userId } = auth();
    const user = userId ? await clerkClient.users.getUser(userId) : null;
    
  return (
    <Visitor user={{name:user?.firstName??'', email: user?.emailAddresses?.[0]?.emailAddress??''}}/>
  )
}

export default VisitorPage