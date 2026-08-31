class LibraryActivity < ApplicationRecord
  AGE_BANDS = { "3-4" => [ 36, 48 ], "4-5" => [ 48, 60 ], "5-6" => [ 60, 72 ] }.freeze

  DOMAIN_NAMES = {
    "PSE" => "Personal, social and emotional",
    "LIT" => "Language and literacy",
    "NUM" => "Numeracy",
    "WAU" => "The world around us",
    "HHS" => "Health, hygiene and safety",
    "ART" => "Creative arts",
    "PHY" => "Physical development"
  }.freeze

  validates :code, presence: true, uniqueness: true
  validates :title, :instructions, presence: true
  validates :age_band, inclusion: { in: AGE_BANDS.keys }
  validates :domain_code, inclusion: { in: DOMAIN_NAMES.keys }

  scope :for_age_band, ->(band) { where(age_band: band) }

  def domain_name
    DOMAIN_NAMES.fetch(domain_code, domain_code)
  end

  def self.band_for_months(months)
    AGE_BANDS.find { |_, (lo, hi)| months >= lo && months < hi }&.first || "5-6"
  end
end
