import { readFileSync } from "fs";

const PASS_THRESHOLD = 95;
const resultsPath = process.argv[2] ?? "playwright-results.json";

let results;
try {
  results = JSON.parse(readFileSync(resultsPath, "utf-8"));
} catch {
  console.error(`결과 파일을 읽을 수 없습니다: ${resultsPath}`);
  process.exit(1);
}

const { expected = 0, unexpected = 0, skipped = 0, flaky = 0 } = results.stats;

const passed = expected + flaky;
const runnable = expected + unexpected + flaky;
const rate = runnable > 0 ? (passed / runnable) * 100 : 100;

console.log("=== Playwright E2E 테스트 결과 ===");
console.log(`통과: ${passed}개 / 실패: ${unexpected}개 / 건너뜀: ${skipped}개`);
console.log(`통과율: ${rate.toFixed(1)}% (기준: ${PASS_THRESHOLD}%)`);

if (rate < PASS_THRESHOLD) {
  console.error(
    `\n❌ PR 차단: ${rate.toFixed(1)}% — ${PASS_THRESHOLD}% 기준 미달`
  );
  process.exit(1);
}

console.log(`\n✅ 기준 통과: ${rate.toFixed(1)}% >= ${PASS_THRESHOLD}%`);
