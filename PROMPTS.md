# Project Prompts

Chronological log of all user prompts used to build **NextBus SG**.

---

## Prompt 1 — Initial Frontend Application
**Timestamp:** `2026-11-26T17:42:21-08:00`

```text
1. Build me a Singapore based bus application that tracks real time bus arrivals times and includes search bar to input bus stop code for quick access to arrival data and favorites functionality. 2. Build just the front end for now, I will establish an api connection later.
```

---

## Prompt 2 — Serverless LTA DataMall v3 Integration
**Timestamp:** `2026-11-26T18:08:58-08:00`

```text
1. add a serverless connection that pulls data from LTA's data mall using the following end points:  # Next buses at a stop (v3, the current version; refreshes every 20 seconds):
https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121
# To ask about one service only, add &ServiceNo=7

# Every request needs the header:  AccountKey: <LTA_ACCOUNT_KEY> 2. store this in /api at project root level (not the src file) 3. include a /health.ts and /busarrival.ts within the same subfolder 4. Do not hardcode any key, i will input them manually
```

---

## Prompt 3 — Fix Vercel `ERESOLVE` Dependency Conflict
**Timestamp:** `2026-11-26T18:19:18-08:00`

```text
fix the error code 10:18:18.435 Running build in Washington, D.C., USA (East) – iad1
10:18:18.437 Build machine configuration: 2 cores, 8 GB
10:18:18.629 Cloning github.com/adrianachiawanlin-cmyk/bus-when (Branch: main, Commit: 2acf4c7)
10:18:18.630 Previous build caches not available.
10:18:18.954 Cloning completed: 325.000ms
10:18:20.100 Running "vercel build"
10:18:20.113 Vercel CLI 66.6.0
10:18:20.908 Installing dependencies...
10:18:21.674 npm warn Unknown env config "cache-dir". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
10:18:34.573 npm error code ERESOLVE
10:18:34.573 npm error ERESOLVE could not resolve
10:18:34.574 npm error
10:18:34.574 npm error Found: esbuild@0.25.12
10:18:34.574 npm error node_modules/esbuild
10:18:34.574 npm error   dev esbuild@"^0.25.0" from the root project
10:18:34.574 npm error
10:18:34.575 npm error Could not resolve dependency:
10:18:34.575 npm error peerOptional esbuild@"^0.27.0 || ^0.28.0" from vite@8.4.0
10:18:34.575 npm error node_modules/vite
10:18:34.575 npm error   vite@"^8.3.0" from the root project
10:18:34.576 npm error   peer vite@"^5.2.0 || ^6 || ^7 || ^8" from @tailwindcss/vite@4.3.5
10:18:34.576 npm error   node_modules/@tailwindcss/vite
10:18:34.576 npm error     @tailwindcss/vite@"^4.3.3" from the root project
10:18:34.577 npm error   1 more (@vitejs/plugin-react)
10:18:34.577 npm error
10:18:34.577 npm error Conflicting peer dependency: esbuild@0.28.2
10:18:34.577 npm error node_modules/tsx/node_modules/esbuild
10:18:34.577 npm error   peerOptional esbuild@"^0.27.0 || ^0.28.0" from vite@8.4.0
10:18:34.577 npm error   node_modules/vite
10:18:34.577 npm error     vite@"^8.3.0" from the root project
10:18:34.577 npm error     peer vite@"^5.2.0 || ^6 || ^7 || ^8" from @tailwindcss/vite@4.3.5
10:18:34.578 npm error     node_modules/@tailwindcss/vite
10:18:34.578 npm error       @tailwindcss/vite@"^4.3.3" from the root project
10:18:34.578 npm error     1 more (@vitejs/plugin-react)
10:18:34.578 npm error
10:18:34.579 npm error Fix the upstream dependency conflict, or retry this command with --force or --legacy-peer-deps to accept an incorrect (and potentially broken) dependency resolution.
10:18:34.579 npm error
10:18:34.580 npm error
10:18:34.580 npm error For a full report see:
10:18:34.580 npm error /vercel/.npm/_logs/2026-11-27T02_18_21_167Z-eresolve-report.txt
10:18:34.580 npm error A complete log of this run can be found in: /vercel/.npm/_logs/2026-11-27T02_18_21_167Z-debug-0.log
10:18:34.624 Error: [BUILD_UTILS_SPAWN_1] Command "npm install" exited with 1
```

---

## Prompt 4 — Collate Prompts
**Timestamp:** `2026-11-26T18:35:50-08:00`

```text
collate all prompts and store them in PROMPTS.md
```
