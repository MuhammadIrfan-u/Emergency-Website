const Submit_btn = document.getElementById('Login');
const Login_Value = document.getElementById('email');
const Login_Password = document.getElementById('password');

Submit_btn.addEventListener('click', function (e) {
  e.preventDefault();

  const Value = Login_Value.value;
  const Pass = Login_Password.value;

  fetch('/Login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: Value, Password: Pass })
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        // Save token
        localStorage.setItem('token', data.token);
        // Redirect to Home
        window.location.href = '/Home';
      } else {
        alert('Login failed');
      }
    })
    .catch(error => console.error('Error:', error));
});
