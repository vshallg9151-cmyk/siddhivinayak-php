const http = require('http');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: e.message, raw: data });
        }
      });
    }).on('error', reject);
  });
}

async function runLiveTests() {
  console.log('=== RUNNING LIVE APACHE + MYSQL VERIFICATION ===\n');
  
  const endpoints = [
    { name: 'Health Check', path: '/siddhivinayak-tours-PHP/api/health.php' },
    { name: 'Vehicles Fleet', path: '/siddhivinayak-tours-PHP/api/vehicles/list.php' },
    { name: 'Indian Cities', path: '/siddhivinayak-tours-PHP/api/cities/list.php' },
    { name: 'Promotional Offers', path: '/siddhivinayak-tours-PHP/api/offers/list.php' },
    { name: 'Customer Reviews', path: '/siddhivinayak-tours-PHP/api/reviews/list.php' },
    { name: 'Tour Packages', path: '/siddhivinayak-tours-PHP/api/packages/list.php' }
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetchJson(`http://localhost${ep.path}`);
      if (res.success) {
        console.log(`[PASS] ${ep.name} (http://localhost${ep.path}): SUCCESS`);
      } else {
        console.log(`[FAIL] ${ep.name}: ${res.message || res.error}`);
      }
    } catch (err) {
      console.error(`[ERROR] ${ep.name}: ${err.message}`);
    }
  }
}

runLiveTests();
