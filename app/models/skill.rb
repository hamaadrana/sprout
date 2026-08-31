class Skill < ApplicationRecord
  belongs_to :domain

  has_many :activities, -> { order(:position) }, dependent: :destroy
  has_many :skill_prerequisites, dependent: :destroy
  has_many :prerequisites, through: :skill_prerequisites, source: :prerequisite_skill
  has_many :dependent_links, class_name: "SkillPrerequisite",
           foreign_key: :prerequisite_skill_id, dependent: :destroy, inverse_of: :prerequisite_skill
  has_many :dependents, through: :dependent_links, source: :skill
  has_many :skill_progress, class_name: "SkillProgress", dependent: :destroy

  validates :code, presence: true, uniqueness: true
  validates :title, :mastery_descriptor, presence: true
  validates :age_min_months, :age_max_months, presence: true,
            numericality: { only_integer: true, greater_than: 0 }

  scope :school_readiness, -> { where(school_readiness: true) }
end
