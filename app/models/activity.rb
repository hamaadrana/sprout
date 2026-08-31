class Activity < ApplicationRecord
  belongs_to :skill
  has_many :resources, dependent: :destroy
  has_many :plan_items, dependent: :restrict_with_error

  enum :kind, {
    hands_on: "hands_on",
    worksheet: "worksheet",
    game: "game",
    conversation: "conversation"
  }, validate: true

  validates :title, :instructions, presence: true
  validates :duration_minutes, numericality: { only_integer: true, greater_than: 0 }
end
