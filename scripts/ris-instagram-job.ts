import { initializeGoogleCredentials } from "../server/googleCredentials";
import {
  initializeRisInstagramTracker,
  runRisInstagramTrackerOnce,
} from "../server/risInstagramTracker";
import { istDay, shiftDay } from "../server/risInstagramTrackerCore";

const job = "RIS Instagram Aryaan";
const day = shiftDay(istDay(new Date()), -1);

async function main() {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await initializeGoogleCredentials();
      await initializeRisInstagramTracker();
      const result = await runRisInstagramTrackerOnce();
      if (result.status === "lease_busy") throw new Error("Another RIS update is in progress");
      console.log(JSON.stringify({
        job, date: result.day, attempt, status: "success",
        rowsWritten: result.rowsWritten, cellsWritten: result.cellsWritten,
        finishedAt: new Date().toISOString(),
      }));
      return;
    } catch (error) {
      console.error(JSON.stringify({
        job, date: day, attempt, status: attempt === 1 ? "retrying" : "failed",
        rowsWritten: [], cellsWritten: 0,
        error: error instanceof Error ? error.message : "Unknown error",
        finishedAt: new Date().toISOString(),
      }));
      if (attempt === 2) {
        process.exitCode = 1;
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 60_000));
    }
  }
}

void main();