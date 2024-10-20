// This code is for v4 of the openai package: npmjs.com/package/openai
import { signInWithGoogle } from "./firebaseConfig";

export const getTime = () => {
  return new Date()
    .toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
    .toLocaleLowerCase();
};

export const distances = [
  { key: 'km', max: 1 },
  { key: 'km', max: 3 },
  { key: 'km', max: 6 },
]

export const periods = [
  { key: 'week', days: 7, min: 70, moment: 1 },
  { key: 'month', days: 28, min: 250, moment: 1 },
  { key: 'months', days: (28 * 6), min: 1500, moment: 6 },
  //{ key: 'year', days: (365), min: 3000, moment: 1 },
]

export function toProperCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

export const handleSignIn = async () => {
  await signInWithGoogle()
}

export const toTitleCase = (str) => {
  return str?.replace(
    /\w\S*/g,
    function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

export const joinListWithCount = (listOfItems) => {
  // Create a dictionary that maps each item to its count.
  const itemCountDict = {};
  for (const item of listOfItems) {
    if (!itemCountDict[item]) {
      itemCountDict[item] = 1;
    } else {
      itemCountDict[item]++;
    }
  }

  // Join the list of items, with the count of each recurring item.
  const joinedList = [];
  for (const [item, count] of Object.entries(itemCountDict)) {
    joinedList.push(`${toTitleCase(item)} ✕ (${count})`);
  }

  // Return the joined list.
  return joinedList.join('\n')
}
export const isBlank = (i) => {
  return i.trim() === ''
}
export const summarizeListWithCount = (listOfItems) => {
  // Create a dictionary that maps each item to its count.
  const itemCountDict = {};
  for (const item of listOfItems) {
    if (!itemCountDict[item]) {
      itemCountDict[item] = 1;
    } else {
      itemCountDict[item]++;
    }
  }


  // Join the list of items, with the count of each recurring item.
  const joinedList = [];
  for (const [item, count] of Object.entries(itemCountDict)) {
    joinedList.push(`${toTitleCase(item)} ✕ (${count})`);
  }

  // Return the joined list.
  return joinedList
}

export const validatePhoneNumber = (phoneNumber) => {
  // Remove any non-digit characters from the phone number
  const digitsOnly = phoneNumber.replace(/\D/g, '');

  // Define the valid prefixes
  const validPrefixes = ['2547', '+2547', '2541', '+2541', '07', '01'];

  // Check if the phone number starts with a valid prefix and has 8 trailing digits
  if (validPrefixes.some(prefix => digitsOnly.startsWith(prefix)) && (digitsOnly.length === 10 || digitsOnly.length === 12)) {
    // Replace the prefix digits as specified
    let result = digitsOnly;
    if (result.startsWith('07')) {
      result = '2547' + result.slice(2);
    } else if (result.startsWith('01')) {
      result = '2541' + result.slice(2);
    } else if (result.startsWith('+2547')) {
      result = '2547' + result.slice(5);
    } else if (result.startsWith('+2541')) {
      result = '2541' + result.slice(5);
    }

    return { "result": result };
  }

  // Return 'invalid' if the criteria are not met
  return { "result": "invalid" };
}

export function isDifferenceLessThanXHours(targetDate, x) {
  // Get the current time
  const now = new Date();
  
  // Convert target date to a Date object if it's not already
  const target = new Date(targetDate);
  
  // Calculate the difference in milliseconds
  const differenceInMs = now - target;
  
  // Convert x hours to milliseconds
  const xHoursInMs = x * 60 * 60 * 1000;
  
  // Check if the difference is less than x hours
  return differenceInMs < xHoursInMs;
}

export const getMoment = () => {

  const utcDate = new Date();

  // Add 3 hours to UTC time (considering daylight saving time is a complex issue, this might need adjustment)
  const date = new Date() //+ (3 * 60 * 60 * 1000));
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  const formattedTime = `${hours}:${minutes}:${seconds}`

  const dayOfWeekNumber = date.getDay();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayOfWeekString = days[dayOfWeekNumber]

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');


  return { date: `${year}-${month}-${day}, ${dayOfWeekString}`, time: formattedTime, window: `:${year}_${month}_${day}_${hours}` };
}
export const processRequestData = (item) => {
  const texts = []
  var total = 0
  item.cart.forEach((item, idx) => {
    var charge = item.discounted ? item.discount : item.price
    // texts.push(`${item.name}${item.discounted?` ~@${item.price}/=~`:''} @ _${charge}/=_`)
    texts.push(`${item.name}`)
    total += charge
  })
  const date = item.logged.toDate()
  const time = date.toLocaleTimeString([], { hour12: true, hour: "2-digit", minute: "2-digit" })
  const shortdate = date.toLocaleDateString("en-GB")


  var p = {
    ...item,
    list: summarizeListWithCount(texts),
    date: `${shortdate}-${time}`,
    total: total
  }
  p['debitedAt']= item.debitedAt ? `${item.debitedAt.toDate().toLocaleDateString("en-GB")}-${item.debitedAt.toDate().toLocaleTimeString([], { hour12: true, hour: "2-digit", minute: "2-digit" })}` : ''
  
  return p
}

export const addDays = (date, days) => {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export const shorten = async (link) => {
  return new Promise(async (resolve, reject) => {
    const url = new URL(
      "https://t.ly/api/v1/link/shorten"
    );

    const headers = {
      "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TLY_API_KEY}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    let body = {
      "long_url": link,
      "description": "Social Media Link"
    };

    await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }).then(response => response.json())
      .then(async (data) => {
        console.log(data)
        data.short_url ?
          resolve(data.short_url)
          : reject()
      })
      .catch((error) => {
        console.error('Error:', error)
        reject()
      });
  })
}

export const generateQRFor = async(id) => {
  return new Promise(async (resolve, reject) => {
  const endpoint = 'https://us-central1-autosoft-614e7.cloudfunctions.net/vision-story'
  const url = `https://qrdb.azurewebsites.net/visitors/${id}`
  const logo_url = 'https://firebasestorage.googleapis.com/v0/b/autosoft-614e7.appspot.com/o/digibelllogo.jpeg?alt=media&token=bb55bc19-eb84-4bad-8b98-33636a0a8bde'


  let body = {
    'yt':logo_url,
    'voice':'',
    "uid": id,
    "url": url,
    'folder': "qr_doorbell",
    'collection': 'Residences'
  }
  console.log(body)
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
  await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  }).then(response => response.json())
    .then(async (data) => {
      data.qrcode ?
        resolve(data.qrcode)
        : reject()
    })
    .catch((error) => {
      console.error('Error:', error)
      reject()
    })
  })
}

export const shortenUrl = async (link, caption) => {
  // const openai = new OpenAI({
  //   apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true
  // });
  // const response = await openai.chat.completions.create({
  //   model: "gpt-3.5-turbo",
  //   messages: [
  //     {
  //       "role": "system",
  //       "content": "\nyou briefly provide a short quipy caption that captures key details, get's to the point, and will have buyers contacting the seller who's listing. you tastefully employ use of emojis in your caption"
  //     },
  //     {
  //       "role": "user",
  //       "content": caption.split('#')[0]
  //     }
  //   ],
  //   temperature: 1.09,
  //   max_tokens: 256,
  //   top_p: 1,
  //   frequency_penalty: 0,
  //   presence_penalty: 0,
  // });
  // const quip = response.choices[0].message.content

  return new Promise(async (resolve, reject) => {
    try {
      const url = await shorten(link)

      resolve(url)//`*Photos:* ${link}\n\nExplore the catalog! 🙌 https://menuflame.com/preloved\n\nSell your stuff 👉 https://menuflame.com`)
    } catch (e) {
      reject()
      alert(e)

    }
  })
}

export const sleep = async (ms) => { return new Promise(resolve => setTimeout(resolve, ms)); }

