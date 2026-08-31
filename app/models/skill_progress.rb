class SkillProgress < ApplicationRecord
  self.table_name = "skill_progress"

  belongs_to :child
  belongs_to :skill

  enum :state, {
    not_started: "not_started",
    introduced: "introduced",
    practising: "practising",
    mastered: "mastered"
  }, validate: true

  validates :skill_id, uniqueness: { scope: :child_id }
end
