const Accept_btn = document.getElementById('Accept');
const container = document.getElementById('button-container');
const Start_Btn=document.getElementById('Start-button');
const socket = io();

function showLoading(duration = 2000) {
  const overlay = document.getElementById('loading-overlay');
  overlay.classList.add('active');
  setTimeout(() => {
    overlay.classList.remove('active');
  }, duration);
}
const audio = new Audio('/sounds/alert.mp3');

function Play_Sound() {
  audio.play().catch((err) => {
    console.error('Sound playback failed:', err);
  });
}




function addButtonRow() {
  const container = document.getElementById('button-container');
  const row = document.createElement('div');
  row.className = 'button-row';
  const acceptBtn = document.createElement('button');
  acceptBtn.className = 'accept-btn';
  acceptBtn.textContent = 'Accept';

  const rejectBtn = document.createElement('button');
  rejectBtn.className = 'reject-btn';
  rejectBtn.textContent = 'Wait';

 
  row.appendChild(acceptBtn);
  row.appendChild(rejectBtn);
  container.appendChild(row);
  Play_Sound();
}




window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  fetch('/api/user', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error('Invalid token or session expired');
      return res.json();
    })
.catch(() => {
      alert('Session expired. Please login again.');
      localStorage.removeItem('token');
      window.location.href = '/';
    });
});







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
          this.userLocation = [33.738045,73.084488];
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

    this.showMarker(this.userLocation,'Need Help ? ');
  }

  showMarker(dest,Msg) {
    if (!this.map) 
      return;
    L.marker(dest)
      .addTo(this.map)
      .bindPopup(`${Msg}`)
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
  })
  .on('routesfound', (e) => {
    this.instructions = [];

    if (e.routes[0].instructions) {
      e.routes[0].instructions.forEach(instr => {
        this.instructions.push(instr.text);
      });
    }

    if (this.instructions.length === 0 && e.routes[0].segments) {
      e.routes[0].segments.forEach(segment => {
        segment.steps.forEach(step => {
          this.instructions.push(step.instruction);
        });
      });
    }
  })
  .addTo(this.map);
}

speaker() {
  if (!this.instructions || this.instructions.length === 0) return;

  let i = 0;
  const speakNext = () => {
    if (i < this.instructions.length) {
      const utterance = new SpeechSynthesisUtterance(this.instructions[i]);
      speechSynthesis.speak(utterance);
      i++;
      setTimeout(speakNext, 2000); // 2 sec delay
    }
  };
  speakNext();
}




  loadDestinationFromServer() {
    fetch('/route')
      .then(res => res.json())
      .then(data => {
        this.destination = data.destination;
        this.showDestinationMarker(this.destination);
        this.showRouteTo(this.destination);
      })
      .catch(err => console.error('Failed to fetch destination:', err));
  }
};

Start_Btn.addEventListener('click', () => {
  showLoading();
  map = new Map();
 
});

socket.on('dispatchAlert', (data) => {
  currentRequestId = data.requesterId;
  map.destination = data.userLocation;
  map.showRouteTo(data.userLocation);
  addButtonRow();
});

const buttonContainer = document.getElementById('button-container');

buttonContainer.addEventListener('click', function (e) {
 
  if (e.target && e.target.classList.contains('accept-btn')) {
    const clickedRow = e.target.closest('.button-row');
    if (!clickedRow) return;

    Array.from(buttonContainer.children).forEach(row => {
      if (row !== clickedRow) {
        row.remove();
           if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      }
    });

    
       if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      }
        
    if (map.userLocation && currentRequestId) {
      const adjustedLocation = [
        map.userLocation[0] + 0.001,
        map.userLocation[1] + 0.001
      ];

      socket.emit('officerAccepted', {
        requesterId: currentRequestId,
        officerLocation: adjustedLocation
      });

       map.map.flyTo(map.userLocation, 16, {
        animate: true,
        duration: 1.5 
      });
      
      map.showRouteTo(map.destination);
    }

    map.speaker();
});


socket.on('requestClosed', () => {
  map.destination = null;
});
