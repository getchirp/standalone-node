const baseUrl = process.env.CHIRP_DEPLOY_URL;

if (!baseUrl) {
  console.error('Set CHIRP_DEPLOY_URL to the deployed site URL before running this check.');
  process.exit(2);
}

let target;
try {
  target = new URL(baseUrl);
} catch {
  console.error(`Invalid CHIRP_DEPLOY_URL: ${baseUrl}`);
  process.exit(2);
}

if (target.protocol !== 'https:') {
  console.error(`CHIRP_DEPLOY_URL must use HTTPS: ${target.href}`);
  process.exit(2);
}

const response = await fetch(target, { redirect: 'manual' });
const headers = Object.fromEntries(response.headers.entries());
const required = {
  'strict-transport-security': (value) => /max-age=\d+/i.test(value) && /includeSubDomains/i.test(value),
  'x-frame-options': (value) => value.trim().toLowerCase() === 'deny',
  'x-content-type-options': (value) => value.trim().toLowerCase() === 'nosniff',
  'referrer-policy': (value) => value.trim().toLowerCase() === 'strict-origin-when-cross-origin',
  'cross-origin-opener-policy': (value) => value.trim().toLowerCase() === 'same-origin',
  'content-security-policy': (value) => value.includes("default-src 'self'") && value.includes("connect-src 'self'"),
  'permissions-policy': (value) => value.includes('camera=()') && value.includes('microphone=()') && value.includes('geolocation=()'),
};

const failures = [];
for (const [name, validate] of Object.entries(required)) {
  const value = headers[name];
  if (!value) {
    failures.push(`${name}: missing`);
  } else if (!validate(value)) {
    failures.push(`${name}: unexpected value`);
  }
}

if (failures.length) {
  console.error(`Header verification failed for ${target.href} (HTTP ${response.status}).`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Security headers verified for ${target.href} (HTTP ${response.status}).`);
