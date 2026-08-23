import http from 'http';

async function testApi() {
  const BASE_URL = 'http://localhost:5000/api';

  const request = (path, method = 'GET', body = null, token = null) => {
    return new Promise((resolve, reject) => {
      const url = new URL(BASE_URL + path);
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const req = http.request(url, { method, headers }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  const loginRes = await request('/auth/login', 'POST', {
    email: 'traveler@globetrotter.com',
    password: 'password1234'
  });
  console.log('Login res:', loginRes.body);
  const token = loginRes.body.token;

  const updateMeRes = await request('/users/me', 'PATCH', { preferred_currency: 'EUR' }, token);
  console.log('Update Me res:', updateMeRes.body);

  const createTripRes = await request('/trips', 'POST', {
    name: 'Autumn Tokyo Discovery',
    start_date: '2026-10-10',
    end_date: '2026-10-18',
    display_currency: 'JPY',
    target_budget: 2000
  }, token);
  console.log('Create Trip res:', createTripRes.body);

  if (createTripRes.body?.id) {
    const budgetRes = await request(`/trips/${createTripRes.body.id}/budget`, 'GET', null, token);
    console.log('Budget res:', budgetRes.body);
  }
}

testApi();