## [1.0.3](https://github.com/Mpratyush54/classstream-backend/compare/v1.0.2...v1.0.3) (2026-09-22)


### Bug Fixes

* guard auth middleware against undefined req.body (GET/HEAD crashed prod with TypeError), return 403 on unknown session ([edc25a9](https://github.com/Mpratyush54/classstream-backend/commit/edc25a9dda09b122e154627aa84e3e71079c91a3))

## [1.0.2](https://github.com/Mpratyush54/classstream-backend/compare/v1.0.1...v1.0.2) (2026-09-22)


### Bug Fixes

* non-fatal video processor boot (local runs without ffmpeg), add missing body-parser/jsonfile deps ([082b662](https://github.com/Mpratyush54/classstream-backend/commit/082b6625e8ee3876da941eec65d72b7d975f4e3d))

## [1.0.1](https://github.com/Mpratyush54/classstream-backend/compare/v1.0.0...v1.0.1) (2026-09-22)


### Bug Fixes

* video playback, notes Manually handling, live status lookup, poster/playvideo hardening + db perf indexes ([1c5988d](https://github.com/Mpratyush54/classstream-backend/commit/1c5988d5e892d2b784d98a0786e0a119a5e7f99d))

# 1.0.0 (2025-10-22)


### Bug Fixes

* return success response for notification status update ([d00e60c](https://github.com/Mpratyush54/classstream-backend/commit/d00e60c920d76e07799cd2bc602dd2c7748813ae))


### Features

* **security:** Implement E2E video DRM and advanced session management ([bd5d298](https://github.com/Mpratyush54/classstream-backend/commit/bd5d2983b22e6a0d31c01ee203164726e89f7a34))
* **video-processing:** add multi-resolution DASH processing, ETA estimation, and metadata storage ([c2968ac](https://github.com/Mpratyush54/classstream-backend/commit/c2968acf3553c40f34db1d859a1a3db475629aad))
* **video:** Filter student video index by class ([43832a5](https://github.com/Mpratyush54/classstream-backend/commit/43832a5dc374de2bd9e4a8b2a294bda6f44531d0))
