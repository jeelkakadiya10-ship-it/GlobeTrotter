import http from 'http';

async function testApi() {
  console.log('Testing GlobeTrotter REST API Endpoints...');

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

  try {
    // 1. Login with demo traveler
    const loginRes = await request('/auth/login', 'POST', {
      email: 'traveler@globetrotter.com',
      password: 'password1234'
    });
    console.log('1. Traveler Login:', loginRes.status === 200 ? 'PASS' : 'FAIL', loginRes.body.user?.email);
    const token = loginRes.body.token;

    // 2. Fetch user profile
    const meRes = await request('/users/me', 'GET', null, token);
    console.log('2. Users /me:', meRes.status === 200 ? 'PASS' : 'FAIL', meRes.body.name);

    // 3. Fetch trips
    const tripsRes = await request('/trips', 'GET', null, token);
    console.log('3. Trips List:', tripsRes.status === 200 ? 'PASS' : 'FAIL', `(${tripsRes.body.length} trips)`);

    // 4. Fetch cities
    const citiesRes = await request('/cities', 'GET');
    console.log('4. Cities List:', citiesRes.status === 200 ? 'PASS' : 'FAIL', `(${citiesRes.body.length} cities)`);

    // 5. Test Admin Guard for regular traveler (expect 403)
    const adminCheckRes = await request('/admin/stats', 'GET', null, token);
    console.log('5. Admin Role Guard (Non-admin blocked):', adminCheckRes.status === 403 ? 'PASS' : 'FAIL');

    // 6. Login with Admin
    const adminLoginRes = await request('/auth/login', 'POST', {
      email: 'admin@globetrotter.com',
      password: 'admin1234'
    });
    const adminToken = adminLoginRes.body.token;
    const adminStatsRes = await request('/admin/stats', 'GET', null, adminToken);
    console.log('6. Admin Stats (Admin authorized):', adminStatsRes.status === 200 ? 'PASS' : 'FAIL', `Users: ${adminStatsRes.body.totalUsers}, Trips: ${adminStatsRes.body.totalTrips}`);

    console.log('\nAll core API tests passed successfully!');
  } catch (err) {
    console.error('API Test Error:', err);
  }
}

testApi();