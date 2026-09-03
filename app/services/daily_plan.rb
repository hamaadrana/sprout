# Returns the persisted plan for a given day, generating it on first access.
# Plans are stored, not computed on read — a refresh must never show a
# different activity.
class DailyPlan
  ITEMS_PER_DAY = 2

  def self.for(child, date: Date.current)
    existing = items_for(child, date)
    return existing if existing.any?

    generate(child, date)
    items_for(child, date)
  end

  def self.items_for(child, date)
    child.plan_items.for_day(date)
         .includes(skill: :domain, activity: :resources)
         .to_a
  end

  # Round-robin across domains so a two-item day mixes numeracy and
  # English rather than serving two skills from whichever domain sorts
  # first.
  def self.pick_skills(child)
    eligible = NextSkill.for(child, limit: ITEMS_PER_DAY * 4)
    by_domain = eligible.group_by(&:domain_id).values
    picks = []
    until picks.length == ITEMS_PER_DAY || by_domain.all?(&:empty?)
      by_domain.each do |queue|
        skill = queue.shift
        picks << skill if skill && picks.length < ITEMS_PER_DAY
      end
    end
    picks
  end

  def self.generate(child, date)
    ActiveRecord::Base.transaction do
      pick_skills(child).each_with_index do |skill, index|
        activity = skill.activities.order(:position).last
        next unless activity

        child.plan_items.create!(
          scheduled_on: date, skill: skill, activity: activity,
          position: index + 1, state: :pending
        )

        progress = SkillProgress.find_or_create_by!(child: child, skill: skill)
        if progress.not_started?
          progress.update!(state: :introduced, introduced_at: Time.current)
        end
      end
    end
  rescue ActiveRecord::RecordNotUnique
    # Two requests generated the same day's plan concurrently; the winner's
    # plan is the plan.
    nil
  end
end
