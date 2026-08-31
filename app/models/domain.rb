class Domain < ApplicationRecord
  has_many :skills, -> { order(:position) }, dependent: :destroy
  has_many :child_domains, dependent: :destroy

  validates :code, presence: true, uniqueness: true
  validates :name, presence: true
end
