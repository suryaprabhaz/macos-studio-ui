import { run } from './suite/index';

async function main() {
  try {
    await run();
    console.log('All tests passed cleanly.');
  } catch (err) {
    console.error('Test suite failed:', err);
    process.exit(1);
  }
}

main();
