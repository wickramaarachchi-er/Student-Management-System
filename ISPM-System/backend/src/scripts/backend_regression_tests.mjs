/**
 * scripts/backend_regression_tests.mjs
 * Quick regression test ensuring all existing module endpoints remain fully functional.
 */
import 'dotenv/config';

const API_BASE = 'http://localhost:5001/api';
const DEFAULT_PASSWORD = 'Ispm@Dev2024!';

async function login(email) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: DEFAULT_PASSWORD }),
  });
  const json = await res.json();
  return json.data.token;
}

async function runRegressionCheck() {
  console.log('====================================================');
  console.log('RUNNING REGRESSION CHECK ON EXISTING MODULE ENDPOINTS');
  console.log('====================================================\n');

  const adminToken = await login('admin@ispm.local');
  const compToken = await login('compliance@ispm.local');
  const trainToken = await login('training@ispm.local');
  const empToken = await login('employee@ispm.local');

  const tests = [
    { route: '/users', token: adminToken, label: '/users (User Management)' },
    { route: '/policies', token: compToken, label: '/policies (Policy Management)' },
    { route: '/training', token: trainToken, label: '/training (Training Management)' },
    { route: '/quizzes', token: trainToken, label: '/quizzes (Quiz Management)' },
    { route: '/compliance/dashboard', token: compToken, label: '/compliance (Compliance Dashboard)' },
    { route: '/helpdesk/tickets', token: empToken, label: '/helpdesk (Helpdesk Tickets)' },
    { route: '/notifications', token: empToken, label: '/notifications (Notifications)' },
    { route: '/audit-logs', token: adminToken, label: '/audit-logs (Audit Logs)' },
  ];

  let passCount = 0;
  let failCount = 0;

  for (const t of tests) {
    const res = await fetch(`${API_BASE}${t.route}`, {
      headers: { Authorization: `Bearer ${t.token}` },
    });
    if (res.ok) {
      console.log(`  [PASS] ${t.label} returned HTTP ${res.status}`);
      passCount++;
    } else {
      console.error(`  [FAIL] ${t.label} returned HTTP ${res.status}`);
      failCount++;
    }
  }

  console.log('\n====================================================');
  console.log(`REGRESSION CHECK TOTAL PASSED: ${passCount} / ${tests.length}`);
  console.log('====================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runRegressionCheck().catch((err) => {
  console.error('Regression test error:', err);
  process.exit(1);
});
