class PlanItem < ApplicationRecord
  belongs_to :child
  belongs_to :skill
  belongs_to :activity
  has_many :log_entries, dependent: :nullify

  enum :state, { pending: "pending", done: "done", skipped: "skipped" }, validate: true

  validates :scheduled_on, presence: true
  validates :position, uniqueness: { scope: [ :child_id, :scheduled_on ] }

  scope :for_day, ->(date) { where(scheduled_on: date).order(:position) }
end
