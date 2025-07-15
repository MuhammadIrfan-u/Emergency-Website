const H_btn = document.getElementById('history');

H_btn.addEventListener('click', async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    alert('No token found. Please log in first. (Client Side)');
    window.location.href = '/';
    return;
  }

  try {
    const response = await fetch('/History', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    const html = await response.text();

    document.open();
    document.write(html);
    document.close();

  } catch (err) {
    console.error('Fetch error:', err);
    alert('Something went wrong while loading history.');
  }
});
