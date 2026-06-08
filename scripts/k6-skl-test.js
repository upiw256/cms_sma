import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 100 }, // Ramp up to 100 users
    { duration: '2m', target: 100 }, // Stay at 100 users for 2 minutes
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests must complete below 1000ms
    http_req_failed: ['rate<0.01'],    // Error rate must be less than 1%
  },
};

const BASE_URL = 'http://localhost:9090'; // Use the Next.js standalone port

export default function () {
  // Simulate user visiting the SKL virtual waiting room
  const res = http.get(`${BASE_URL}/skl`);
  
  check(res, {
    'is status 200': (r) => r.status === 200,
    'contains portal kelulusan text': (r) => r.body.includes('Portal'),
  });

  // Small sleep to simulate user reading the page before reloading or interacting
  sleep(Math.random() * 2 + 1); 
}
