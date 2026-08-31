class PortfolioItem < ApplicationRecord
  belongs_to :child
  belongs_to :skill, optional: true

  has_one_attached :image

  validates :taken_on, presence: true
end
