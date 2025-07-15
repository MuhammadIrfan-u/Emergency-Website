    const cards = document.querySelectorAll(".card");
    let currentIndex = 0;

    function updateActiveCard(index) {
      cards.forEach((card, i) => {
        card.classList.toggle("active", i === index);
      });
      const container = document.getElementById("cardContainer");
      const cardWidth = cards[0].offsetWidth + 32;
      container.style.transform = `translateX(${-index * cardWidth}px)`;
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        currentIndex = (currentIndex + 1) % cards.length;
        updateActiveCard(currentIndex);
      } else if (e.key === "ArrowLeft") {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        updateActiveCard(currentIndex);
      }
    });


    


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

