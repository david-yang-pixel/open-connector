interface NumerologyProfiles {
  pythagorean: readonly string[];
  chaldean: readonly string[];
  kabbalah: readonly string[];
  ank_jyotish: readonly string[];
}
export const numerologyProfiles: NumerologyProfiles = {
  pythagorean: [
    "standard",
    "raw_date",
    "pythagorean-component-preserve-core-v1",
    "pythagorean-raw-date-preserve-core-v1",
  ],
  chaldean: ["current_name", "birth_name", "chaldean-cheiro-current-name-v1", "chaldean-cheiro-birth-name-v1"],
  kabbalah: [
    "standard",
    "ordinal",
    "reduced_letters",
    "reduced_total",
    "full_letter_names",
    "full_letter_names_reduced",
    "kabbalah-gematria-hechrechi-v1",
    "kabbalah-gematria-siduri-v1",
    "kabbalah-gematria-katan-v1",
    "kabbalah-gematria-katan-mispari-v1",
    "kabbalah-gematria-millui-alef-v1",
    "kabbalah-gematria-millui-alef-reduced-v1",
  ],
  ank_jyotish: ["standard", "ank-jyotish-civil-cheiro-navagraha-reduce-all-v1"],
};
