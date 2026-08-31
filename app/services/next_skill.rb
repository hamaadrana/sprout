# Picks the next skill(s) to teach: any skill in the child's active domains
# whose prerequisites are all mastered, preferring skills already started
# ("finish what you started") and then curriculum position.
#
# Deliberately dumb. No spaced repetition, no adaptive difficulty.
class NextSkill
  def self.for(child, limit: 1)
    mastered = child.skill_progress.mastered.pluck(:skill_id).to_set
    started = child.introduced_skill_ids.to_set

    Skill.where(domain: child.active_domains)
         .includes(:prerequisites)
         .where.not(id: mastered.to_a)
         .select { |s| s.prerequisite_ids.all? { |id| mastered.include?(id) } }
         .sort_by { |s| [ started.include?(s.id) ? 0 : 1, s.position ] }
         .first(limit)
  end
end
