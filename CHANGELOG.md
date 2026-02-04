# Changelog

## [0.10.0](https://github.com/ddloophq/betterdocx/compare/betterdocx-v0.9.1...betterdocx-v0.10.0) (2026-02-04)


### ⚠ BREAKING CHANGES

* Add ProtonMail as user ([#2793](https://github.com/ddloophq/betterdocx/issues/2793))

### Features

* Add ability to detect patches which are present in a file ([#2633](https://github.com/ddloophq/betterdocx/issues/2633)) ([9627957](https://github.com/ddloophq/betterdocx/commit/962795743c4f21d84c52e47e4f82dcf4ca536dc3))
* Add npm publish GitHub Action workflow ([#2762](https://github.com/ddloophq/betterdocx/issues/2762)) ([07f363f](https://github.com/ddloophq/betterdocx/commit/07f363fcb7641264d553481d4e66b3db9aa9c9ea))
* add support for custom patch delimiters in PatchDocumentOptions ([#3036](https://github.com/ddloophq/betterdocx/issues/3036)) ([5af1045](https://github.com/ddloophq/betterdocx/commit/5af1045a59d9434d304c1574eeec8209e17b76bf))
* Added NumberedItemReference ([#3042](https://github.com/ddloophq/betterdocx/issues/3042)) ([7f26bad](https://github.com/ddloophq/betterdocx/commit/7f26badbc93213eaf7e24852c74b9fc45a940c4d))
* Added TableCellSpacing ([#3052](https://github.com/ddloophq/betterdocx/issues/3052)) ([44d4b93](https://github.com/ddloophq/betterdocx/commit/44d4b93d064ab03561f2980a82373c9a4f953160))
* **comments:** Support comment pictures ([#3032](https://github.com/ddloophq/betterdocx/issues/3032)) ([b190258](https://github.com/ddloophq/betterdocx/commit/b19025881b8acfb0fd42c3d5a44fb3b37ca46ea6))
* **docs:** add llm accept header support and fix branding ([5ca6795](https://github.com/ddloophq/betterdocx/commit/5ca67955c87602e05605d2f94d26546249b26a5e))
* subfile overrides ([#2941](https://github.com/ddloophq/betterdocx/issues/2941)) ([05fcf6e](https://github.com/ddloophq/betterdocx/commit/05fcf6edd43c3b4cc818ed3f76422b8d8ae33da3))


### Bug Fixes

* [#2082](https://github.com/ddloophq/betterdocx/issues/2082) Numbering instance restart number not work since v8.0.0 and work well in v7.8.2 ([1fa8c7a](https://github.com/ddloophq/betterdocx/commit/1fa8c7ac828892120a421d88be57ffd093a9ef3e))
* [#2082](https://github.com/ddloophq/betterdocx/issues/2082) Numbering instance restart number not work since v8.0.0 and work well in v7.8.2 ([3997b7a](https://github.com/ddloophq/betterdocx/commit/3997b7a5d67e428c73f68bef9f25a8e32f384671))
* add rel to fontTable ([#2800](https://github.com/ddloophq/betterdocx/issues/2800)) ([05a3cf5](https://github.com/ddloophq/betterdocx/commit/05a3cf5b439f4ca59565a281bf25ebe013a2601c))
* added unique numeric id creator to avoid numbering render errors ([c898d0a](https://github.com/ddloophq/betterdocx/commit/c898d0a3c3b2dfbd5aa8b601db073c75fc72a70a))
* added unique numeric id creator to avoid numbering render errors ([c59c535](https://github.com/ddloophq/betterdocx/commit/c59c5350fdbd55ff5bc71506917c75fbfb202457))
* canonicalize &lt;w:rPr&gt; element order for Word compatibility ([#3140](https://github.com/ddloophq/betterdocx/issues/3140)) ([0ce302c](https://github.com/ddloophq/betterdocx/commit/0ce302ce035c88f3809463b66eac49edd4f5480c))
* custom fonts support on the Browser ([#2898](https://github.com/ddloophq/betterdocx/issues/2898)) ([7b9b474](https://github.com/ddloophq/betterdocx/commit/7b9b474484d5a30a4da862f4868e138795fafbf6))
* do not use static numeric counters ([c0c6200](https://github.com/ddloophq/betterdocx/commit/c0c62001fec494b6f75de3ee73a65204994120ee))
* do not use static numeric counters ([a043738](https://github.com/ddloophq/betterdocx/commit/a0437381e71ca555b0d53a503551209395a31674))
* Ensure necessary namespaces are in patched doc ([#2698](https://github.com/ddloophq/betterdocx/issues/2698)) ([ff37f3b](https://github.com/ddloophq/betterdocx/commit/ff37f3b4602e6feed0240336e768b2b17dd41a36))
* export numbered item reference ([#3243](https://github.com/ddloophq/betterdocx/issues/3243)) ([7111f01](https://github.com/ddloophq/betterdocx/commit/7111f01a3d4e140142212c84842c1884481529b2))
* Missing text property for patchDocument ([#2760](https://github.com/ddloophq/betterdocx/issues/2760)) ([2d2e4cd](https://github.com/ddloophq/betterdocx/commit/2d2e4cdab241594b3e1500d976968dadacb847c1))
* MS article URL in docs ([#3197](https://github.com/ddloophq/betterdocx/issues/3197)) ([bd01690](https://github.com/ddloophq/betterdocx/commit/bd01690b66554a4f7ba1aa2c1bb2f5634a2a495e))
* npm publish install ([6e371d4](https://github.com/ddloophq/betterdocx/commit/6e371d42a7072bac824fe3c45d9a74645028e250))
* omit empty descr/title in &lt;wp:docPr&gt; for Word 2007 compatibility ([#3073](https://github.com/ddloophq/betterdocx/issues/3073)) ([1e6c9e1](https://github.com/ddloophq/betterdocx/commit/1e6c9e17726ac6747638a0b0241e7acd149391fc))
* patchDocument, looks for namspaces more carefully over whole doc… ([#2943](https://github.com/ddloophq/betterdocx/issues/2943)) ([fc86e18](https://github.com/ddloophq/betterdocx/commit/fc86e1842ddebb3ecdda0f4b3dbea34ca4e11914))
* **replacer:** errors suppressed by catch statement ([#2856](https://github.com/ddloophq/betterdocx/issues/2856)) ([3997ce5](https://github.com/ddloophq/betterdocx/commit/3997ce538dd2131634594154c455f651b31b6e74))
* separate vertical alignment enums for ITableCellOptions and ISectionPropertiesOptions ([#3079](https://github.com/ddloophq/betterdocx/issues/3079)) ([7d11299](https://github.com/ddloophq/betterdocx/commit/7d1129900f97b825efb7407027780c2a28bc6389))
* unit tests fix ([704c678](https://github.com/ddloophq/betterdocx/commit/704c678333d7ba2abe0462531b30dd134d5f54ae))
* Use browser compatable Buffer ([#3057](https://github.com/ddloophq/betterdocx/issues/3057)) ([44ed2d6](https://github.com/ddloophq/betterdocx/commit/44ed2d69435a743f7614e9fc918ec058c6fd4800))


### Documentation

* Add ProtonMail as user ([#2793](https://github.com/ddloophq/betterdocx/issues/2793)) ([9cff0b2](https://github.com/ddloophq/betterdocx/commit/9cff0b2a57bfe2952a0607865041f70d39ca1120))
