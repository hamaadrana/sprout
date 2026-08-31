# Records the outcome of a taught session and moves skill progress forward,
# in one transaction. Log entries are the audit trail; skill_progress is the
# denormalised read model.
#
# Rules: "needs practice" keeps the skill in rotation as practising;
# two consecutive "got it" outcomes mark the skill mastered.
class SessionLogger
  def self.log(plan_item:, outcome:, minutes: nil, note: nil)
    child = plan_item.child
    skill = plan_item.skill

    ActiveRecord::Base.transaction do
      previous = child.log_entries.where(skill: skill).order(:logged_on, :id).last

      entry = child.log_entries.create!(
        plan_item: plan_item, skill: skill, outcome: outcome,
        minutes: minutes, note: note, logged_on: Date.current
      )

      plan_item.update!(state: :done)

      progress = SkillProgress.find_or_create_by!(child: child, skill: skill)
      mastered = entry.got_it? && previous&.got_it?

      progress.update!(
        state: mastered ? :mastered : :practising,
        attempts_count: progress.attempts_count + 1,
        introduced_at: progress.introduced_at || Time.current,
        mastered_at: mastered ? Time.current : nil
      )

      entry
    end
  end
end
