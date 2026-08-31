class Term < ApplicationRecord
  belongs_to :child

  validates :name, :starts_on, :ends_on, presence: true
  validate :ends_after_starts

  private

  def ends_after_starts
    return if starts_on.blank? || ends_on.blank?
    errors.add(:ends_on, "must be after the start date") if ends_on <= starts_on
  end
end
