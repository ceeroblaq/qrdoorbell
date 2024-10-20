import React from 'react'
import { auth, clerkClient, getAuth } from '@clerk/nextjs/server'
import Owner from '../../components/Owner';
import { getOwner } from '../../helpers/firebaseConfig';

const OwnerPage= async()=> {
    auth().protect()
    const { userId } = auth();
    const user = userId ? await clerkClient.users.getUser(userId) : null;
    const owner = await getOwner(userId)

  return (
    <Owner user={{uid: userId, owner: owner[0], name:user?.firstName??'', email: user?.emailAddresses?.[0]?.emailAddress??''}}/>
  )
}

export default OwnerPage