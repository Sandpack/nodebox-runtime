# Changelog

## [0.0.39](https://github.com/codesandbox/nodebox-internal/compare/nodebox-v0.0.38...nodebox-v0.0.39) (2023-02-16)


### Bug Fixes

* readme links ([#306](https://github.com/codesandbox/nodebox-internal/issues/306)) ([d83bbbc](https://github.com/codesandbox/nodebox-internal/commit/d83bbbcd0e0d33931a7cafd419252bf68d84b093))
* **readme:** remove sentence about VMs ([#312](https://github.com/codesandbox/nodebox-internal/issues/312)) ([6c9260f](https://github.com/codesandbox/nodebox-internal/commit/6c9260f1f6cb806351327a69fef316982b0f94af))
* update configuration steps ([#310](https://github.com/codesandbox/nodebox-internal/issues/310)) ([9d7df79](https://github.com/codesandbox/nodebox-internal/commit/9d7df79ffb90b67632e3e20ba2c2ef5125e0df4d))

## [0.0.38](https://github.com/codesandbox/nodebox/compare/nodebox-v0.0.37...nodebox-v0.0.38) (2023-02-15)


### Features

* **nodebox:** make runtime URL optional and imply the default value ([#299](https://github.com/codesandbox/nodebox/issues/299)) ([bb65224](https://github.com/codesandbox/nodebox/commit/bb6522498fe8529ac74c79ab1bb238727127bdb0))

## [0.0.37](https://github.com/codesandbox/nodebox/compare/nodebox-v0.0.36...nodebox-v0.0.37) (2023-02-08)


### Bug Fixes

* **progress message:** drop `progress` key in favor of `totalPending` ([#292](https://github.com/codesandbox/nodebox/issues/292)) ([9856a15](https://github.com/codesandbox/nodebox/commit/9856a155e536ae24072c818e8b68986bd27702bc))
* **shell:** emit "exit" when shell exits ([#287](https://github.com/codesandbox/nodebox/issues/287)) ([3b25008](https://github.com/codesandbox/nodebox/commit/3b25008cb386ef45b58b0672b16a86a86ced2593))

## [0.0.36](https://github.com/codesandbox/nodebox/compare/nodebox-v0.0.35...nodebox-v0.0.36) (2023-02-02)


### Bug Fixes

* incorrect cdnUrl typings on runtime iframe protocol ([b68abb2](https://github.com/codesandbox/nodebox/commit/b68abb272265b96086ac904f232583e933238b92))

## [0.0.35](https://github.com/codesandbox/nodebox/compare/nodebox-v0.0.34...nodebox-v0.0.35) (2023-01-26)


### Features

* accept custom "cdnUrl" ([#273](https://github.com/codesandbox/nodebox/issues/273)) ([21cca7a](https://github.com/codesandbox/nodebox/commit/21cca7a298c64d355bc125ff12339e3c82d8e00f))

## [0.0.34](https://github.com/codesandbox/nodebox/compare/nodebox-v0.0.33...nodebox-v0.0.34) (2023-01-17)


### Bug Fixes

* improve error handling, support operation rejections ([#251](https://github.com/codesandbox/nodebox/issues/251)) ([78ce271](https://github.com/codesandbox/nodebox/commit/78ce2714e5c29839e93a655e250042aac57ff36d))

## [0.0.33](https://github.com/codesandbox/nodebox/compare/nodebox-v0.0.32...nodebox-v0.0.33) (2023-01-10)


### Bug Fixes

* rename publish script and folder name ([#239](https://github.com/codesandbox/nodebox/issues/239)) ([2dac1db](https://github.com/codesandbox/nodebox/commit/2dac1dba061a1ff42adb29d6265ff88ebc4993ff))

## [0.0.32](https://github.com/codesandbox/nodebox/compare/nodebox-v0.0.31...nodebox-v0.0.32) (2023-01-10)


### Features

* remove picomatch for simple glob util ([#236](https://github.com/codesandbox/nodebox/issues/236)) ([0d10685](https://github.com/codesandbox/nodebox/commit/0d10685a5b733155a50fc928872a90eb966e975a))
* **shell:** implement stdout/stderr emitters ([#227](https://github.com/codesandbox/nodebox/issues/227)) ([cd7cd9a](https://github.com/codesandbox/nodebox/commit/cd7cd9a63a1c515a04e4d713c9a324773a2fb72a))


### Bug Fixes

* **shell:** replace "shell.listen()" with "shell.on()" ([#234](https://github.com/codesandbox/nodebox/issues/234)) ([1774241](https://github.com/codesandbox/nodebox/commit/17742414bc938707d9142e1895b64f522c5366a0))

## [0.0.31](https://github.com/codesandbox/nodebox/compare/nodebox-v0.0.30...nodebox-v0.0.31) (2022-12-20)


### Features

* **shell:** replace ".exit()" with ".kill()" ([#226](https://github.com/codesandbox/nodebox/issues/226)) ([43b6e78](https://github.com/codesandbox/nodebox/commit/43b6e78b67ace366ade9fab96e37e79ee66fa6db))


### Bug Fixes

* **nodebox:** check url argument, improve error messages ([#218](https://github.com/codesandbox/nodebox/issues/218)) ([f9ec17c](https://github.com/codesandbox/nodebox/commit/f9ec17c33d674ccb73f1b15dbb4f442ae2b39c15))

## [0.0.30](https://github.com/codesandbox/nodebox/compare/nodebox-v0.0.29...nodebox-v0.0.30) (2022-12-14)


### Features

* Refactor node worker spawning to use MessageChannel ([#205](https://github.com/codesandbox/nodebox/issues/205)) ([6896135](https://github.com/codesandbox/nodebox/commit/6896135706bf2bd847c34ab9d289eb67de76a2f7))

## [0.0.29](https://github.com/codesandbox/nodebox/compare/nodebox-v0.0.28...nodebox-v0.0.29) (2022-12-08)


### Bug Fixes

* update deferred promises ([#200](https://github.com/codesandbox/nodebox/issues/200)) ([d11066e](https://github.com/codesandbox/nodebox/commit/d11066eb2852b51717f237b918b8eb8f4c878274))

## [0.0.28](https://github.com/codesandbox/browser-node-emulator/compare/nodebox-v0.0.27...nodebox-v0.0.28) (2022-11-29)


### Features

* **bridge:** improve worker handling, use MessageChannel for worker ([#162](https://github.com/codesandbox/browser-node-emulator/issues/162)) ([bbe1e11](https://github.com/codesandbox/browser-node-emulator/commit/bbe1e11679daed2b28ff8eec1d5e6aad39373976))
* fs refactor ([#100](https://github.com/codesandbox/browser-node-emulator/issues/100)) ([5797d19](https://github.com/codesandbox/browser-node-emulator/commit/5797d19528defb2724abbd1d2cf0cb03d05b2b60))
* **fs:** FSWatcher ([#75](https://github.com/codesandbox/browser-node-emulator/issues/75)) ([b378b76](https://github.com/codesandbox/browser-node-emulator/commit/b378b763e85ec24b117a3ac962ee22ef39f22738))
* **fs:** read / write files ([#60](https://github.com/codesandbox/browser-node-emulator/issues/60)) ([05c032d](https://github.com/codesandbox/browser-node-emulator/commit/05c032dbe33916faa563a858c67e464c9b03a9f6))
* **node emulator:** preview interface ([#41](https://github.com/codesandbox/browser-node-emulator/issues/41)) ([e7e66bb](https://github.com/codesandbox/browser-node-emulator/commit/e7e66bbaced7cf5eb20d14b58816e11737f9c3ed))
* **public fs:** implement fs watch ([#90](https://github.com/codesandbox/browser-node-emulator/issues/90)) ([fe9b0b6](https://github.com/codesandbox/browser-node-emulator/commit/fe9b0b68ef61532483a326e3d3ea0b9e565bc273))
* **runtime:** runtime protocols ([#131](https://github.com/codesandbox/browser-node-emulator/issues/131)) ([18a92b9](https://github.com/codesandbox/browser-node-emulator/commit/18a92b993d3d21475a903708ff565bb3cf586583))
* **shell:** Allow custom commands ([#61](https://github.com/codesandbox/browser-node-emulator/issues/61)) ([c90890d](https://github.com/codesandbox/browser-node-emulator/commit/c90890db2e0f1c143221772ab76eacb3cafbe23f))
* **shellProcess:** consume stdout ([#94](https://github.com/codesandbox/browser-node-emulator/issues/94)) ([7e5667e](https://github.com/codesandbox/browser-node-emulator/commit/7e5667ebaecf2afb968a1ceb6cf57a90df1a9575))
* **shellProcess:** on exit ([#108](https://github.com/codesandbox/browser-node-emulator/issues/108)) ([dcbd2c5](https://github.com/codesandbox/browser-node-emulator/commit/dcbd2c59aec2479617a37972507081b90bc88fbb))
* **shell:** ShellProcess interface ([#72](https://github.com/codesandbox/browser-node-emulator/issues/72)) ([cdc0cf7](https://github.com/codesandbox/browser-node-emulator/commit/cdc0cf759f016ac5c923bb957caefd555ccaafab))
* Worker progress messages ([#122](https://github.com/codesandbox/browser-node-emulator/issues/122)) ([084eb2f](https://github.com/codesandbox/browser-node-emulator/commit/084eb2f9cfe63d205894e7dd5f89016a40b0b200))


### Bug Fixes

* **emulator:** get rid of internal dependency ([#173](https://github.com/codesandbox/browser-node-emulator/issues/173)) ([b0db69a](https://github.com/codesandbox/browser-node-emulator/commit/b0db69adb70cb4619169dc6a56c1423f17307217))
* **emulator:** get rid of internal dependency ([#173](https://github.com/codesandbox/browser-node-emulator/issues/173)) ([d4c9b8f](https://github.com/codesandbox/browser-node-emulator/commit/d4c9b8f94bfb310949ed90005bb615b9ecf88f4a))
* **node-emulator:** set build target to es2020 ([#38](https://github.com/codesandbox/browser-node-emulator/issues/38)) ([5ff50fc](https://github.com/codesandbox/browser-node-emulator/commit/5ff50fca586101b6270f5f587900a031466c024a))
* **node-emulator:** trigger a new publish ([4b42c8f](https://github.com/codesandbox/browser-node-emulator/commit/4b42c8f43c8dea0491b48af067b07eb74922848f))
* **node-emulator:** trigger a new publish ([baef111](https://github.com/codesandbox/browser-node-emulator/commit/baef111bc1bd3bd34b5ff82fbeaa0a141372c417))
* **node-emulator:** trigger a new publish ([#171](https://github.com/codesandbox/browser-node-emulator/issues/171)) ([8485b15](https://github.com/codesandbox/browser-node-emulator/commit/8485b151f3cbfd88692183a48a263ef070da08b3))
* **NodeEmulator.ts:** export FilesMap type to consumer ([#57](https://github.com/codesandbox/browser-node-emulator/issues/57)) ([d676be5](https://github.com/codesandbox/browser-node-emulator/commit/d676be50f20f6d88bd7bbd6fa9edf3047e5fa8f2))
* Potential race condition with public api ([#111](https://github.com/codesandbox/browser-node-emulator/issues/111)) ([e5e0492](https://github.com/codesandbox/browser-node-emulator/commit/e5e04929c2f2b1dc28a22970bd1e796ed2119236))
* **preview:** remove conditional over listener ([#53](https://github.com/codesandbox/browser-node-emulator/issues/53)) ([5c6e8c0](https://github.com/codesandbox/browser-node-emulator/commit/5c6e8c0a0600a3b408f734a17b13a8f37ef8e09d))
* public watch api and public message bus refactor ([#117](https://github.com/codesandbox/browser-node-emulator/issues/117)) ([2d23b09](https://github.com/codesandbox/browser-node-emulator/commit/2d23b0969652d9c1ff17a9fac79d512f53c332f8))
* remove handshake timeout log ([49413a6](https://github.com/codesandbox/browser-node-emulator/commit/49413a6dde5d8300e626298553fb09a9ce32cf4c))
* **runtime protocol:** remove promise ([#139](https://github.com/codesandbox/browser-node-emulator/issues/139)) ([51a996e](https://github.com/codesandbox/browser-node-emulator/commit/51a996e64ba105bc2a1164bf09000a13f9076936))
* **runtime-protocol.types.ts:** export `InjectMessage` type ([#133](https://github.com/codesandbox/browser-node-emulator/issues/133)) ([b47387a](https://github.com/codesandbox/browser-node-emulator/commit/b47387adbb303552fdc1dd8f0a3aab93704a7550))
* **shell stdout:** fix types ([#105](https://github.com/codesandbox/browser-node-emulator/issues/105)) ([e77d244](https://github.com/codesandbox/browser-node-emulator/commit/e77d244ce2d9ca45ff6a28d0b60dc51b3c512eb7))
* **ShellProcess:** drop restart ([#88](https://github.com/codesandbox/browser-node-emulator/issues/88)) ([5371e4b](https://github.com/codesandbox/browser-node-emulator/commit/5371e4b681c4806112873e1c58a9fafea418ddb6))
* **shellprocess:** reassign internal state to running after restart ([#77](https://github.com/codesandbox/browser-node-emulator/issues/77)) ([13ae624](https://github.com/codesandbox/browser-node-emulator/commit/13ae6242aded1e8896256bb6a78edeb764aecf81))
* **shellprocess:** returning id on restart ([#78](https://github.com/codesandbox/browser-node-emulator/issues/78)) ([23f1230](https://github.com/codesandbox/browser-node-emulator/commit/23f1230c33b8c84911eede9d03d3b9e9bb2ac62f))
* UI tweak on fallback page and improve conditional on FS module ([#102](https://github.com/codesandbox/browser-node-emulator/issues/102)) ([bdfb9cc](https://github.com/codesandbox/browser-node-emulator/commit/bdfb9cc7e89992017bf257133500261fbe7eb933))
* Use picomatch-browser and fix build script ([#125](https://github.com/codesandbox/browser-node-emulator/issues/125)) ([521a432](https://github.com/codesandbox/browser-node-emulator/commit/521a432e22f6b11cc119af19c06ed29fdaad218f))
* **worker controller:** fix exit/restart worker ([#114](https://github.com/codesandbox/browser-node-emulator/issues/114)) ([fbb9ad5](https://github.com/codesandbox/browser-node-emulator/commit/fbb9ad5f890c8e188f9cd7c3b39f71de0e9a3c7e))

## [0.0.27](https://github.com/codesandbox/browser-node-emulator/compare/node-emulator-v0.0.26...node-emulator-v0.0.27) (2022-11-24)


### Features

* **bridge:** improve worker handling, use MessageChannel for worker ([#162](https://github.com/codesandbox/browser-node-emulator/issues/162)) ([bbe1e11](https://github.com/codesandbox/browser-node-emulator/commit/bbe1e11679daed2b28ff8eec1d5e6aad39373976))

## [0.0.26](https://github.com/codesandbox/browser-node-emulator/compare/node-emulator-v0.0.25...node-emulator-v0.0.26) (2022-11-22)


### Bug Fixes

* **emulator:** get rid of internal dependency ([#173](https://github.com/codesandbox/browser-node-emulator/issues/173)) ([d4c9b8f](https://github.com/codesandbox/browser-node-emulator/commit/d4c9b8f94bfb310949ed90005bb615b9ecf88f4a))

## [0.0.25](https://github.com/codesandbox/browser-node-emulator/compare/node-emulator-v0.0.24...node-emulator-v0.0.25) (2022-11-22)


### Bug Fixes

* **node-emulator:** trigger a new publish ([#171](https://github.com/codesandbox/browser-node-emulator/issues/171)) ([8485b15](https://github.com/codesandbox/browser-node-emulator/commit/8485b151f3cbfd88692183a48a263ef070da08b3))

## [0.0.24](https://github.com/codesandbox/browser-node-emulator/compare/node-emulator-v0.0.23...node-emulator-v0.0.24) (2022-11-10)


### Bug Fixes

* **runtime protocol:** remove promise ([#139](https://github.com/codesandbox/browser-node-emulator/issues/139)) ([51a996e](https://github.com/codesandbox/browser-node-emulator/commit/51a996e64ba105bc2a1164bf09000a13f9076936))

## [0.0.23](https://github.com/codesandbox/browser-node-emulator/compare/node-emulator-v0.0.22...node-emulator-v0.0.23) (2022-11-10)


### Bug Fixes

* **runtime-protocol.types.ts:** export `InjectMessage` type ([#133](https://github.com/codesandbox/browser-node-emulator/issues/133)) ([b47387a](https://github.com/codesandbox/browser-node-emulator/commit/b47387adbb303552fdc1dd8f0a3aab93704a7550))

## [0.0.22](https://github.com/codesandbox/browser-node-emulator/compare/node-emulator-v0.0.21...node-emulator-v0.0.22) (2022-11-10)


### Features

* **runtime:** runtime protocols ([#131](https://github.com/codesandbox/browser-node-emulator/issues/131)) ([18a92b9](https://github.com/codesandbox/browser-node-emulator/commit/18a92b993d3d21475a903708ff565bb3cf586583))

## [0.0.21](https://github.com/codesandbox/browser-node-emulator/compare/node-emulator-v0.0.20...node-emulator-v0.0.21) (2022-11-01)


### Bug Fixes

* Use picomatch-browser and fix build script ([#125](https://github.com/codesandbox/browser-node-emulator/issues/125)) ([521a432](https://github.com/codesandbox/browser-node-emulator/commit/521a432e22f6b11cc119af19c06ed29fdaad218f))

## [0.0.20](https://github.com/codesandbox/browser-node-emulator/compare/node-emulator-v0.0.19...node-emulator-v0.0.20) (2022-11-01)


### Features

* Worker progress messages ([#122](https://github.com/codesandbox/browser-node-emulator/issues/122)) ([084eb2f](https://github.com/codesandbox/browser-node-emulator/commit/084eb2f9cfe63d205894e7dd5f89016a40b0b200))

## [0.0.19](https://github.com/codesandbox/browser-node-emulator/compare/node-emulator-v0.0.18...node-emulator-v0.0.19) (2022-10-31)


### Bug Fixes

* public watch api and public message bus refactor ([#117](https://github.com/codesandbox/browser-node-emulator/issues/117)) ([2d23b09](https://github.com/codesandbox/browser-node-emulator/commit/2d23b0969652d9c1ff17a9fac79d512f53c332f8))

## [0.0.18](https://github.com/codesandbox/browser-node-emulator/compare/node-emulator-v0.0.17...node-emulator-v0.0.18) (2022-10-28)


### Bug Fixes

* **worker controller:** fix exit/restart worker ([#114](https://github.com/codesandbox/browser-node-emulator/issues/114)) ([fbb9ad5](https://github.com/codesandbox/browser-node-emulator/commit/fbb9ad5f890c8e188f9cd7c3b39f71de0e9a3c7e))

## [0.0.17](https://github.com/codesandbox/browser-node-emulator/compare/node-emulator-v0.0.16...node-emulator-v0.0.17) (2022-10-28)


### Features

* **shellProcess:** on exit ([#108](https://github.com/codesandbox/browser-node-emulator/issues/108)) ([dcbd2c5](https://github.com/codesandbox/browser-node-emulator/commit/dcbd2c59aec2479617a37972507081b90bc88fbb))


### Bug Fixes

* Potential race condition with public api ([#111](https://github.com/codesandbox/browser-node-emulator/issues/111)) ([e5e0492](https://github.com/codesandbox/browser-node-emulator/commit/e5e04929c2f2b1dc28a22970bd1e796ed2119236))

## [0.0.16](https://github.com/codesandbox/browser-node-emulator/compare/node-emulator-v0.0.15...node-emulator-v0.0.16) (2022-10-28)


### Features

* fs refactor ([#100](https://github.com/codesandbox/browser-node-emulator/issues/100)) ([5797d19](https://github.com/codesandbox/browser-node-emulator/commit/5797d19528defb2724abbd1d2cf0cb03d05b2b60))


### Bug Fixes

* **shell stdout:** fix types ([#105](https://github.com/codesandbox/browser-node-emulator/issues/105)) ([e77d244](https://github.com/codesandbox/browser-node-emulator/commit/e77d244ce2d9ca45ff6a28d0b60dc51b3c512eb7))

## [0.0.15](https://github.com/codesandbox/browser-node-emulator/compare/node-emulator-v0.0.14...node-emulator-v0.0.15) (2022-10-28)


### Features

* **shellProcess:** consume stdout ([#94](https://github.com/codesandbox/browser-node-emulator/issues/94)) ([7e5667e](https://github.com/codesandbox/browser-node-emulator/commit/7e5667ebaecf2afb968a1ceb6cf57a90df1a9575))

## [0.0.14](https://github.com/codesandbox/browser-node-emulator/compare/node-emulator-v0.0.13...node-emulator-v0.0.14) (2022-10-27)


### Bug Fixes

* UI tweak on fallback page and improve conditional on FS module ([#102](https://github.com/codesandbox/browser-node-emulator/issues/102)) ([bdfb9cc](https://github.com/codesandbox/browser-node-emulator/commit/bdfb9cc7e89992017bf257133500261fbe7eb933))

## [0.0.13](https://github.com/codesandbox/browser-node-emulator/compare/node-emulator-v0.0.12...node-emulator-v0.0.13) (2022-10-27)


### Features

* **public fs:** implement fs watch ([#90](https://github.com/codesandbox/browser-node-emulator/issues/90)) ([fe9b0b6](https://github.com/codesandbox/browser-node-emulator/commit/fe9b0b68ef61532483a326e3d3ea0b9e565bc273))

## [0.0.12](https://github.com/codesandbox/browser-node-emulator/compare/node-emulator-v0.0.11...node-emulator-v0.0.12) (2022-10-25)


### Features

* **fs:** FSWatcher ([#75](https://github.com/codesandbox/browser-node-emulator/issues/75)) ([b378b76](https://github.com/codesandbox/browser-node-emulator/commit/b378b763e85ec24b117a3ac962ee22ef39f22738))


### Bug Fixes

* **ShellProcess:** drop restart ([#88](https://github.com/codesandbox/browser-node-emulator/issues/88)) ([5371e4b](https://github.com/codesandbox/browser-node-emulator/commit/5371e4b681c4806112873e1c58a9fafea418ddb6))
* **shellprocess:** reassign internal state to running after restart ([#77](https://github.com/codesandbox/browser-node-emulator/issues/77)) ([13ae624](https://github.com/codesandbox/browser-node-emulator/commit/13ae6242aded1e8896256bb6a78edeb764aecf81))

## [0.0.11](https://github.com/codesandbox/browser-node-emulator/compare/node-emulator-v0.0.10...node-emulator-v0.0.11) (2022-10-21)


### Bug Fixes

* **shellprocess:** returning id on restart ([#78](https://github.com/codesandbox/browser-node-emulator/issues/78)) ([23f1230](https://github.com/codesandbox/browser-node-emulator/commit/23f1230c33b8c84911eede9d03d3b9e9bb2ac62f))

## [0.0.10](https://github.com/codesandbox/browser-node-emulator/compare/node-emulator-v0.0.9...node-emulator-v0.0.10) (2022-10-20)


### Features

* **shell:** ShellProcess interface ([#72](https://github.com/codesandbox/browser-node-emulator/issues/72)) ([cdc0cf7](https://github.com/codesandbox/browser-node-emulator/commit/cdc0cf759f016ac5c923bb957caefd555ccaafab))

## [0.0.9](https://github.com/codesandbox/browser-node-emulator/compare/node-emulator-v0.0.8...node-emulator-v0.0.9) (2022-10-18)


### Features

* **fs:** read / write files ([#60](https://github.com/codesandbox/browser-node-emulator/issues/60)) ([05c032d](https://github.com/codesandbox/browser-node-emulator/commit/05c032dbe33916faa563a858c67e464c9b03a9f6))
* **shell:** Allow custom commands ([#61](https://github.com/codesandbox/browser-node-emulator/issues/61)) ([c90890d](https://github.com/codesandbox/browser-node-emulator/commit/c90890db2e0f1c143221772ab76eacb3cafbe23f))

## [0.0.8](https://github.com/codesandbox/browser-node-emulator/compare/node-emulator-v0.0.7...node-emulator-v0.0.8) (2022-10-17)


### Bug Fixes

* **NodeEmulator.ts:** export FilesMap type to consumer ([#57](https://github.com/codesandbox/browser-node-emulator/issues/57)) ([d676be5](https://github.com/codesandbox/browser-node-emulator/commit/d676be50f20f6d88bd7bbd6fa9edf3047e5fa8f2))

## [0.0.7](https://github.com/codesandbox/browser-node-emulator/compare/node-emulator-v0.0.6...node-emulator-v0.0.7) (2022-10-14)


### Bug Fixes

* **preview:** remove conditional over listener ([#53](https://github.com/codesandbox/browser-node-emulator/issues/53)) ([5c6e8c0](https://github.com/codesandbox/browser-node-emulator/commit/5c6e8c0a0600a3b408f734a17b13a8f37ef8e09d))

## [0.0.6](https://github.com/codesandbox/browser-node-emulator/compare/node-emulator-v0.0.5...node-emulator-v0.0.6) (2022-10-14)


### Bug Fixes

* **node-emulator:** trigger a new publish ([4b42c8f](https://github.com/codesandbox/browser-node-emulator/commit/4b42c8f43c8dea0491b48af067b07eb74922848f))

## [0.0.5](https://github.com/codesandbox/browser-node-emulator/compare/node-emulator-v0.0.4...node-emulator-v0.0.5) (2022-10-14)


### Features

* **node emulator:** preview interface ([#41](https://github.com/codesandbox/browser-node-emulator/issues/41)) ([e7e66bb](https://github.com/codesandbox/browser-node-emulator/commit/e7e66bbaced7cf5eb20d14b58816e11737f9c3ed))

## [0.0.4](https://github.com/codesandbox/browser-node-emulator/compare/node-emulator-v0.0.3...node-emulator-v0.0.4) (2022-10-11)


### Bug Fixes

* **node-emulator:** set build target to es2020 ([#38](https://github.com/codesandbox/browser-node-emulator/issues/38)) ([5ff50fc](https://github.com/codesandbox/browser-node-emulator/commit/5ff50fca586101b6270f5f587900a031466c024a))

## [0.0.3](https://github.com/codesandbox/browser-node-emulator/compare/node-emulator-v0.0.2...node-emulator-v0.0.3) (2022-10-11)


### Bug Fixes

* **node-emulator:** trigger a new publish ([baef111](https://github.com/codesandbox/browser-node-emulator/commit/baef111bc1bd3bd34b5ff82fbeaa0a141372c417))

## [0.0.2](https://github.com/codesandbox/browser-node-emulator/compare/node-emulator-v0.0.1...node-emulator-v0.0.2) (2022-10-10)


### Bug Fixes

* remove handshake timeout log ([49413a6](https://github.com/codesandbox/browser-node-emulator/commit/49413a6dde5d8300e626298553fb09a9ce32cf4c))
