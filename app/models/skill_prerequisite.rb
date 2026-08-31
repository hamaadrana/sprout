class SkillPrerequisite < ApplicationRecord
  belongs_to :skill
  belongs_to :prerequisite_skill, class_name: "Skill"

  validates :prerequisite_skill_id, uniqueness: { scope: :skill_id }
  validate :not_self_referential

  private

  def not_self_referential
    errors.add(:prerequisite_skill_id, "cannot be the skill itself") if skill_id == prerequisite_skill_id
  end
end
