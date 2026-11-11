# Firmware and embedded routes

Read this when the target is a firmware image, an ESP32-family image, or a Linux kernel module.

- Firmware image: `inspect_firmware_regions` when advertised. Use
  `extract_firmware` when extraction is requested, with a caller-selected new
  absolute output directory. These tools use caller-supplied Binwalk/Unblob on
  Linux; see the [firmware guide](https://github.com/morluto/rea/blob/main/docs/firmware-analysis.md).
- ESP32-family app or bootloader image (`0xE9` magic): `inspect_artifact`
  without a provider; see the ESP section of `native-and-artifacts.md`.

- Linux kernel module metadata: `inspect_kernel_module` with the explicit local
  ELF32/ELF64 relocatable file. This built-in target-free inspection requires
  no Linux host or `modinfo`. Preserve `.modinfo` key order and duplicate keys,
  `__versions` CRC hex, section file ranges, and the appended signature
  trailer's PKCS#7 SHA-256. A missing section is observed absence when section
  names are known, not proof the module never carried that metadata.
  `struct module` is not decoded. The signature is not validated. gzip, xz, and
  zstd containers are unsupported; decompress into a separate file with an
  external codec utility, then inspect the decompressed `ET_REL` image. See the
  [kernel module guide](https://github.com/morluto/rea/blob/main/docs/kernel-modules.md).
