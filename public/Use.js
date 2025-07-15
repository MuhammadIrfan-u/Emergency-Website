
const Help_btn = document.getElementById('help');
const Search_btn=document.getElementById('Search');
Search_btn.style.backgroundColor='red';
const socket = io();



let map;
let currentRequestId = null; 

class Map {
  constructor() {
    this.mapId = document.getElementById('map');
    this.destination = null;
    this.map = null;
    this.userLocation = null;
    this.routeControl = null;
    this.init();
  }

  init() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.userLocation = [latitude, longitude];
          this.displayMap();
        },
        () => console.error('Failed to get your location.')
      );
    } else {
      console.error('Geolocation not supported by this browser.');
    }
  }

  displayMap() {
    this.map = L.map(this.mapId).setView(this.userLocation, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    L.marker(this.userLocation)
      .addTo(this.map)
      .bindPopup('You are here 📍')
      .openPopup();
  }

  showRouteTo(dest) {
    if (!this.map || !this.userLocation || !dest) return;

    if (this.routeControl) {
      this.map.removeControl(this.routeControl);
    }

    this.routeControl = L.Routing.control({
      waypoints: [
        L.latLng(this.userLocation),
        L.latLng(dest)
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      createMarker: () => null,
      lineOptions: {
        styles: [{ color: 'red', weight: 8, opacity: 0.7 }]
      },
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      })
    }).addTo(this.map);
  }
}

document.addEventListener("DOMContentLoaded", () => {
   map = new Map();

});



Help_btn.addEventListener('click', () => {
  if (map.userLocation) {
    socket.emit('helpRequested', {
      location: map.userLocation,
      destination: map.destination
    });
  }
});


Help_btn.addEventListener('click',()=>{

 
  Search_btn.classList.remove('hidden');
  Help_btn.classList.add('hidden');

  setTimeout(function(){
    Help_btn.classList.remove('hidden');
    Search_btn.classList.add('hidden');
  },8000);

  
})



socket.on('requestAccepted', (data) => {
  Help_btn.classList.add('hidden');
  if (map) {
    L.marker(data.officerLocation)
      .addTo(map.map)
      .bindPopup('Help is on the way 🚓')
      .openPopup();

    map.destination = data.officerLocation;
    map.showRouteTo(data.officerLocation);

  }
});


