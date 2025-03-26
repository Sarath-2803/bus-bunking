import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { firestore } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
import { getAuth, signinWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import { query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBaTbi1991gm29Mkg8fF7SzrhwmR35Lg6o",
    authDomain: "bus-connect-1b577.firebaseapp.com",
    projectId: "bus-connect-1b577",
    storageBucket: "bus-connect-1b577.firebasestorage.app",
    messagingSenderId: "389708422203",
    appId: "1:389708422203:web:910ce222b141a55e6c501e"
  };

const app = initializeApp(firebaseConfig);
const firestore= firebase.firestore(app);
const db = getFirestore();
const auth = getAuth();

//user 
const travellingfrom = document.getElementById('travellingfrom');
const travellingto = document.getElementById('travellingto');

//operator
const todestination = document.getElementById('todestination');
const fromdestination = document.getElementById('fromdestination');
const id = document.getElementById('id');

//operator login
async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User logged in:", userCredential.user);
        window.location.href = "operator.html";
    } catch (error) {
        alert("Login failed !");
    }
}

//operator page code
/// Function to find buses with a common last element in the routePath array
async function findBusesGroupedByLastElement() {
    try {
        // Reference the "busRoutes" collection
        const busRoutesRef = collection(db, "busRoutes");

        // Fetch all bus routes
        const querySnapshot = await getDocs(busRoutesRef);

        // Object to group buses by their last element
        const busesByLastElement = {};

        // Iterate through the documents to group buses by the last element of routePath
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const routePath = data.routePath; // Array of locations (e.g., ["A", "B", "C", "D"])

            if (routePath && routePath.length > 0) {
                const lastElement = routePath[routePath.length - 1]; // Get the last element of the array

                // Initialize the set for this destination if it doesn't exist
                if (!busesByLastElement[lastElement]) {
                    busesByLastElement[lastElement] = new Set();
                }

                // Add the bus ID to the set for this destination
                busesByLastElement[lastElement].add(doc.id);
            }
        });

        // Convert sets to arrays for the final output
        const formattedResult = {};
        for (const [lastElement, ids] of Object.entries(busesByLastElement)) {
            formattedResult[lastElement] = Array.from(ids);
        }

        // Log the grouped buses
        console.log("Buses Grouped by Last Element:", formattedResult);
    }
}

        //alert("Buses grouped by their last element have been logged to the console.");
        //return formattedResult; // Return the grouped object if needed elsewhere
    /* catch (e) {
        console.error("Error finding buses with a common last element:", e);
        alert("Failed to find buses with a common last element.");
    } */



//location of destination
// Function to fetch GPS coordinates for a place using OpenStreetMap Nominatim API
// Function to fetch GPS coordinates for a place using OpenStreetMap Nominatim API
async function getGPSLocationForPlace(place) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        place
    )}&format=json&limit=1`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.length > 0) {
            const location = data[0];
            return { latitude: parseFloat(location.lat), longitude: parseFloat(location.lon) };
        } else {
            console.error(`No GPS location found for place: ${place}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching GPS location for place: ${place}`, error);
        return null;
    }
}



/*
//uploading operator data
async function uploadData(){
    const docRef = await addDoc(collection(db, "busRoutes"), {
        id: id
    });
}  */

  /*  // Function to search for bus routes and find the current location of the operator
    async function searchBusRouteAndFindOperatorLocation() {
        try {
            // Get the values from the input fields
            const from = travellingfrom.value.trim();
            const to = travellingto.value.trim();
    
            // Reference the "busRoutes" collection
            const busRoutesRef = collection(db, "busRoutes");
    
            // Fetch all bus routes
            const querySnapshot = await getDocs(busRoutesRef);
    
            let matchingBuses = [];
    
            // Iterate through the documents to find matching routes
            for (const doc of querySnapshot.docs) {
                const data = doc.data();
                const routePath = data.routePath; // Array of locations (e.g., ["A", "B", "C", "D"])
    
                if (routePath) {
                    const fromIndex = routePath.indexOf(from);
                    const toIndex = routePath.indexOf(to);
    
                    // Check if both locations exist in the route and are in the correct order
                    if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
                        matchingBuses.push({
                            id: doc.id,
                            routePath: routePath,
                            starting: data.starting,
                            Destination: data.Destination,
                            operatorId: data.operatorId, // Assuming operatorId is stored in the busRoutes collection
                        });
                    }
                }
            }
    
            // Check if any buses match the criteria
            if (matchingBuses.length === 0) {
                alert("No matching bus routes found.");
                return;
            }
    
            console.log("Matching Buses:", matchingBuses);
    
            // Fetch the current location of each operator
            for (const bus of matchingBuses) {
                const operatorId = bus.operatorId;
    
                if (operatorId) {
                    // Reference the "operators" collection to get the current location
                    const operatorDocRef = doc(db, "operators", operatorId);
                    const operatorDoc = await getDoc(operatorDocRef);
    
                    if (operatorDoc.exists()) {
                        const operatorData = operatorDoc.data();
                        console.log(`Operator ID: ${operatorId}, Current Location:`, operatorData.currentLocation);
                    } else {
                        console.log(`Operator with ID ${operatorId} not found.`);
                    }
                } else {
                    console.log(`No operator ID found for bus route ID: ${bus.id}`);
                }
            }
    
            alert(`Found ${matchingBuses.length} matching bus route(s)! Check the console for details.`);
        } catch (e) {
            console.error("Error searching for bus routes and operator locations:", e);
            alert("Failed to search for bus routes and operator locations.");
        }
    }
        */

async function getData() {
    try {
        // Reference the "busRoutes" collection
        const querySnapshot = await getDocs(collection(db, "busRoutes"));

        // Iterate through the documents and log their data
        querySnapshot.forEach((doc) => {
            console.log(`${doc.id} =>`, doc.data());
        });

        alert("Data fetched successfully! Check the console for details.");
    } catch (e) {
        console.error("Error fetching documents: ", e);
        alert("Failed to fetch data.");
    }
}

// Function to get the user's current GPS location
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject("Geolocation is not supported by your browser.");
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    resolve({ latitude, longitude });
                },
                (error) => {
                    reject("Unable to retrieve location: " + error.message);
                }
            );
        }
    });
}


const location = async () =>{
    return await getCurrentLocation();
}
