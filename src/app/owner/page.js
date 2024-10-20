import React from 'react'
import { auth, clerkClient, getAuth } from '@clerk/nextjs/server'
import Owner from '../../components/Owner';

const OwnerPage= async()=> {
    auth().protect()
    const { userId } = auth();
    const user = userId ? await clerkClient.users.getUser(userId) : null;
  return (
    <Owner user={{name:user?.firstName??'', email: user?.emailAddresses?.[0]?.emailAddress??''}}/>
  )
}

export default OwnerPage