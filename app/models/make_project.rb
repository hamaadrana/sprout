class MakeProject < ApplicationRecord
  CATEGORIES = %w[paper planting recycled festive kitchen toy textile].freeze
  MESS_LEVELS = %w[low medium high].freeze

  validates :code, presence: true, uniqueness: true
  validates :title, presence: true
  validates :category, inclusion: { in: CATEGORIES }
  validates :mess_level, inclusion: { in: MESS_LEVELS }
  validates :age_band, inclusion: { in: LibraryActivity::AGE_BANDS.keys }

  scope :for_age_band, ->(band) { where(age_band: band) }
end
