class Child < ApplicationRecord
  belongs_to :user

  has_many :child_domains, dependent: :destroy
  has_many :domains, through: :child_domains
  has_many :skill_progress, class_name: "SkillProgress", dependent: :destroy
  has_many :plan_items, dependent: :destroy
  has_many :log_entries, dependent: :destroy
  has_many :portfolio_items, dependent: :destroy
  has_many :terms, dependent: :destroy

  enum :framing, { coverage: "coverage", readiness: "readiness" }, validate: true

  validates :name, presence: true
  validates :date_of_birth, presence: true

  def active_domains
    domains.merge(ChildDomain.where(active: true))
  end

  # "4y 2m" — shown in the app chrome next to the child's name.
  def age_label(on: Date.current)
    months = age_in_months(on: on)
    "#{months / 12}y #{months % 12}m"
  end

  def age_in_months(on: Date.current)
    (on.year * 12 + on.month) - (date_of_birth.year * 12 + date_of_birth.month) -
      (on.day < date_of_birth.day ? 1 : 0)
  end

  def mastered_skill_ids
    skill_progress.mastered.pluck(:skill_id)
  end

  # Skills the child has started (introduced or practising) but not yet mastered.
  def introduced_skill_ids
    skill_progress.where(state: %w[introduced practising]).pluck(:skill_id)
  end
end
