class LogEntry < ApplicationRecord
  belongs_to :child
  belongs_to :plan_item, optional: true
  belongs_to :skill

  enum :outcome, { got_it: "got_it", needs_practice: "needs_practice" }, validate: true

  validates :logged_on, presence: true
end
