import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, createUserWithEmailAndPassword, FacebookAuthProvider, signInWithRedirect, getRedirectResult, signInWithPopup, signOut } from "firebase/auth";
// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
import { getFirestore, collection, getDocs, getDoc, doc, query, where, Timestamp, addDoc, orderBy, limit, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
// import {...} from "firebase/functions";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";

import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import axios from 'axios';



// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDCuwWHLDk-BKDMUFFGRVQgtagDDEbbWjw",
    authDomain: "autosoft-614e7.firebaseapp.com",
    databaseURL: 'https://autosoft-614e7.firebaseio.com',
    projectId: "autosoft-614e7",
    storageBucket: "autosoft-614e7.appspot.com",
    messagingSenderId: "860007949461",
    appId: "1:860007949461:web:cc1d25273ed7b783f1a79c",
    measurementId: "G-RDEYD6BDCJ"
};

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const storage = getStorage(app);

export const auth = initializeAuth(app);


export const COLLECTION = {
    users: 'Residences',
    rings: 'Rings',
}

export const setUser = async (did) => {
    const q = query(
        collection(db, `${COLLECTION.users}`),
        where('members', 'array-contains', did)
    )
    const querySnapshot = await getDocs(q)
    const data = []
    if (querySnapshot.empty) {
        const docData = {
            created: Timestamp.fromDate(new Date()),
            members: arrayUnion(did)
        }
        await addDoc(collection(COLLECTION.users), docData)
    } else {
        querySnapshot.forEach(async (doc) => {
            data.push({
                id: doc.id,
                created: doc.data().created,
                members: doc.data().members
            })
        })
    }
}


export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider(app)
    // provider.addScope('https://www.googleapis.com/auth/youtube.force-ssl');
    signInWithPopup(auth, provider)
        .then(async (result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            //check if user exists

            const user_doc = doc(db, COLLECTION.users, user.uid);
            const docSnap = await getDoc(user_doc);

            if (docSnap.exists()) {
                await updateDoc(user_doc, { token: token })
                // doc.data() will be undefined in this case
                console.log("User exists!");
            } else {
                const docData = {
                    created: Timestamp.fromDate(new Date()),
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    token: token,
                    channelName: user.displayName,
                    photo: user.photoURL,
                    service: "digibell"
                }

                await setDoc(user_doc, docData)
            }
        }).catch((error) => {
            console.log(error);
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
        });
}


export const logout = (onAuth) => {
    signOut(auth).then(() => {
        // Sign-out successful.
        onAuth()
    }).catch((error) => {
        // An error happened.
    });
}


const updateUserDoc = async (uid, data) => {
    const user_doc = doc(db, COLLECTION.users, uid);
    await setDoc(user_doc, data, { merge: true })
}




const getDataRequests = async (col) => {
    const querySnapshot = await getDocs(col);
    const data = []
    if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
            data.push({
                rid: doc.id,
                uid: doc.data().uid,
                pid: doc.data().pid,
                status: doc.data().status,
                time: doc.data().time,
            })
        })
    }

    return data
}




export const getUserInfo = async () => {
    const id = auth.currentUser.uid

    const ref = doc(db, COLLECTION.users, id)
    const u = await getDoc(ref)
    const data = {
        id: u.id,
        email: u.data().email,
        name: u.data().name
    }

    return data
}




const handleUrl = async (url, ask) => {
    const yt = ask
    const endpoint = `https://us-central1-autosoft-614e7.cloudfunctions.net/vision-story`;
    const body = JSON.stringify({ url: url, voice: 1, yt: yt, tag: '' })

    try {
        console.log('fetching')
        const call = await fetch(endpoint, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: body,
        })

        const response = await call.json()
        console.log(response)
    } catch (err) {
        console.log(err);
    }
}

export const uploadImage = async (setUploading, image, ask) => {
    setUploading(true)
    const resp = await fetch(image.uri)
    const blob = await resp.blob()
    const filename = `${'test'}.jpg`
    const storageRef = ref(storage, `/images/${filename}`)
    const uploadTask = uploadBytesResumable(storageRef, blob);
    uploadTask.on(
        "state_changed",
        (snapshot) => {
            const percent = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            )
            // update progress
            // setPercent(percent)
            console.log(percent)
        },
        (err) => {
            setUploading(false)
            console.log(err)
        },
        () => {
            // download url
            getDownloadURL(uploadTask.snapshot.ref).then(async (url) => {
                const data = { photo: url }
                console.log(data)
                await handleUrl(url, ask)
                setUploading(false)
            });
        }
    );
}


export const getAsks = async () => {
    const q = query(
        collection(db, `${COLLECTION.asks}`),
        orderBy('ask', 'asc')
    )

    const querySnapshot = await getDocs(q);
    const asks = []
    if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
            asks.push({
                key: doc.id,
                ask: doc.data().ask,
            })
        })
    }
    return asks
}

const getId = async () => {
    const id = Platform.OS === 'ios' ? await Application.getIosIdForVendorAsync() : Application.androidId
    return id
}

export const getOwner = async (did) => {
    const q = query(
        collection(db, `${COLLECTION.users}`),
        where('members', 'array-contains', did)
    )
    const querySnapshot = await getDocs(q)
    const data = []
    if (querySnapshot.empty) {
        return data
    } else {
        querySnapshot.forEach((doc) => {
            data.push({
                id: doc.id,
                created: doc.data().created,
                members: doc.data().members,
                name: doc.data().name,
                token: doc.data().belltoken,
                qrcode: doc.data().qrcode
            })
        })
        return data
    }
}

export const createResidence = async (name, token, id) => {
    const docData = {
        created: Timestamp.fromDate(new Date()),
        members: arrayUnion(id),
        name: name,
        belltoken: token
    }
    const d = await addDoc(collection(db, COLLECTION.users), docData)

    return d.id
}
export const joinResidence = async (resid) => {
    const id = await getId()
    const docData = {
        members: arrayUnion(id)
    }
    await updateDoc(doc(db, COLLECTION.users, resid), docData)
}
export const ringResidence = async (id, callback) => {
    const u = await getDoc(doc(db, COLLECTION.users, id))
    const docData = {
        created: Timestamp.fromDate(new Date()),
        residence: arrayUnion(id),
        token: u.data().belltoken,
    }
    
    const d = await addDoc(collection(db, COLLECTION.rings), docData)
    callback({body:"There's a guest at the door", id: d.id, token: docData.token})

}
export const getQRDownloadURL = async (id) => {
    return new Promise(async (resolve, reject) => {

        const path = `qr_doorbell/${id}.png`
        try {
            const storageRef = ref(storage, path)
            // Download File with Firebase Storage Reference
            const url = await getDownloadURL(storageRef)
            console.log(url)
            // Fetch the image from the URL using axios
            const response = await axios.get(url, {
                responseType: "blob", // Important to handle it as a Blob
            });

            // Create a blob from the response
            const blob = new Blob([response.data]);
            const href = URL.createObjectURL(blob);
            resolve(href)
        } catch (error) {
            console.error("Error downloading the image:", error);
            reject()
        }

    })

}