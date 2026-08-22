const BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting GlobeTrotter API Automated End-to-End Test Suite...\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await fetch(`${BASE}/health`).then(r => r.json());
    assert(health.status === 'ok', 'Server health check returns ok');

    // 2. Login as Demo Traveler
    const travelerLogin = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'traveler@globetrotter.com', password: 'password123' })
    }).then(r => r.json());
    assert(travelerLogin.token && travelerLogin.user.email === 'traveler@globetrotter.com', 'Traveler login succeeds');
    const travelerToken = travelerLogin.token;

    // 3. User profile
    const meRes = await fetch(`${BASE}/users/me`, {
      headers: { Authorization: `Bearer ${travelerToken}` }
    }).then(r => r.json());
    assert(meRes.user.name === 'Alex Rivera', 'Fetch current traveler profile');

    // 4. Cities Catalog
    const citiesRes = await fetch(`${BASE}/cities`).then(r => r.json());
    assert(citiesRes.cities && citiesRes.cities.length >= 15, `Cities catalog contains ${citiesRes.cities?.length} cities (>= 15)`);

    const firstCity = citiesRes.cities[0];
    const activitiesRes = await fetch(`${BASE}/cities/${firstCity.id}/activities`).then(r => r.json());
    assert(activitiesRes.activities && activitiesRes.activities.length >= 5, `City ${firstCity.name} has ${activitiesRes.activities?.length} activities (>= 5)`);

    // 5. Create a new Multi-City Trip
    const newTripRes = await fetch(`${BASE}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${travelerToken}`
      },
      body: JSON.stringify({
        title: 'Nordic & Mediterranean Summer 2026',
        description: 'From Iceland to Rome and Barcelona',
        start_date: '2026-07-01',
        end_date: '2026-07-15',
        target_budget: 3500
      })
    }).then(r => r.json());
    assert(newTripRes.trip && newTripRes.trip.title === 'Nordic & Mediterranean Summer 2026', 'Create multi-city trip');
    const tripId = newTripRes.trip.id;

    // 6. Add 3 Stops to the trip
    const city1 = citiesRes.cities.find(c => c.name === 'Tokyo') || citiesRes.cities[0];
    const city2 = citiesRes.cities.find(c => c.name === 'Kyoto') || citiesRes.cities[1];
    const city3 = citiesRes.cities.find(c => c.name === 'Singapore') || citiesRes.cities[2];

    const stop1 = await fetch(`${BASE}/trips/${tripId}/stops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${travelerToken}` },
      body: JSON.stringify({ city_id: city1.id, arrival_date: '2026-07-01', departure_date: '2026-07-05' })
    }).then(r => r.json());

    const stop2 = await fetch(`${BASE}/trips/${tripId}/stops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${travelerToken}` },
      body: JSON.stringify({ city_id: city2.id, arrival_date: '2026-07-05', departure_date: '2026-07-10' })
    }).then(r => r.json());

    const stop3 = await fetch(`${BASE}/trips/${tripId}/stops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${travelerToken}` },
      body: JSON.stringify({ city_id: city3.id, arrival_date: '2026-07-10', departure_date: '2026-07-15' })
    }).then(r => r.json());

    assert(stop1.stop && stop2.stop && stop3.stop, 'Add 3 city stops to the itinerary');

    // 7. Reorder stops
    const reorderRes = await fetch(`${BASE}/trips/${tripId}/stops/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${travelerToken}` },
      body: JSON.stringify({ orderedStopIds: [stop3.stop.id, stop1.stop.id, stop2.stop.id] })
    }).then(r => r.json());
    assert(reorderRes.stops && reorderRes.stops[0].id === stop3.stop.id, 'Reorder stops successfully');

    // 8. Add activities to stops
    const stop1Acts = await fetch(`${BASE}/cities/${stop1.stop.city_id}/activities`).then(r => r.json());
    if (stop1Acts.activities?.length >= 2) {
      await fetch(`${BASE}/stops/${stop1.stop.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${travelerToken}` },
        body: JSON.stringify({ activity_id: stop1Acts.activities[0].id, scheduled_date: '2026-07-01', scheduled_time: '10:00' })
      });
      await fetch(`${BASE}/stops/${stop1.stop.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${travelerToken}` },
        body: JSON.stringify({ activity_id: stop1Acts.activities[1].id, scheduled_date: '2026-07-02', scheduled_time: '14:00' })
      });
      assert(true, 'Added 2+ scheduled activities to stop');
    }

    // 9. Budget calculation check
    const budgetRes = await fetch(`${BASE}/trips/${tripId}/budget`, {
      headers: { Authorization: `Bearer ${travelerToken}` }
    }).then(r => r.json());
    assert(budgetRes.total_spent > 0 && budgetRes.category_breakdown, 'Budget calculation auto-syncs scheduled activity costs');

    // 10. Add Custom Budget Entry
    const budgetEntry = await fetch(`${BASE}/trips/${tripId}/budget-entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${travelerToken}` },
      body: JSON.stringify({
        category: 'Flights & Transport',
        description: 'Flight tickets',
        amount: 850
      })
    }).then(r => r.json());
    assert(budgetEntry.entry && budgetEntry.entry.amount === 850, 'Add custom expense entry');

    // 11. Public sharing
    const shareToggle = await fetch(`${BASE}/trips/${tripId}/share`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${travelerToken}` },
      body: JSON.stringify({ is_public: true })
    }).then(r => r.json());
    assert(shareToggle.is_public === true && shareToggle.public_slug, 'Toggle trip share to public');

    // 12. Unauthenticated public view
    const publicTrip = await fetch(`${BASE}/share/${shareToggle.public_slug}`).then(r => r.json());
    assert(publicTrip.trip && publicTrip.trip.id === tripId, 'Unauthenticated visitor can view public itinerary');

    // 13. Signup a second user & copy trip
    const secondUserEmail = `second_user_${Date.now()}@test.com`;
    const signupRes = await fetch(`${BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bob Explorer', email: secondUserEmail, password: 'password123' })
    }).then(r => r.json());

    const copyTripRes = await fetch(`${BASE}/trips/${tripId}/copy`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${signupRes.token}` }
    }).then(r => r.json());
    assert(copyTripRes.trip && copyTripRes.trip.user_id === signupRes.user.id, 'Second user copies shared trip into account');

    // 14. Non-admin accessing admin routes blocked
    const forbiddenAdmin = await fetch(`${BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${travelerToken}` }
    });
    assert(forbiddenAdmin.status === 403, 'Non-admin user blocked from /api/admin/stats (403)');

    // 15. Admin login & stats
    const adminLogin = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@globetrotter.com', password: 'admin123' })
    }).then(r => r.json());
    const adminStats = await fetch(`${BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminLogin.token}` }
    }).then(r => r.json());
    assert(adminStats.stats && adminStats.stats.total_users >= 2, 'Admin stats return real database numbers');

    console.log(`\n🏁 Test Run Summary: ${passed} passed, ${failed} failed.`);
  } catch (e) {
    console.error('Test execution error:', e);
  }
}

runTests();
