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

  # Round-robin across domains so days mix subjects. With more domains
  # than daily slots, the starting domain rotates with the date, so every
  # domain gets its turn across the week instead of the first two hogging
  # the plan. Started-but-unmastered skills still jump the queue.
  def self.pick_skills(child, date)
    eligible = NextSkill.for(child, limit: ITEMS_PER_DAY * 8)
    started, fresh = eligible.partition { |s| child.introduced_skill_ids.include?(s.id) }

    by_domain = fresh.group_by(&:domain_id).values
    by_domain.rotate!(date.yday % by_domain.length) if by_domain.any?

    picks = started.first(ITEMS_PER_DAY)
    until picks.length == ITEMS_PER_DAY || by_domain.all?(&:empty?)
      by_domain.each do |queue|
        skill = queue.shift
        picks << skill if skill && picks.length < ITEMS_PER_DAY && !picks.include?(skill)
      end
    end
    picks
  end

  def self.generate(child, date)
    ActiveRecord::Base.transaction do
      pick_skills(child, date).each_with_index do |skill, index|
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
