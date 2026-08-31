class TodayController < ApplicationController
  before_action :require_child!

  def show
    items = DailyPlan.for(current_child, date: Date.current)
    mastered = current_child.skill_progress.mastered.count
    total = Skill.where(domain: current_child.active_domains).count
    pending = items.select(&:pending?)

    render inertia: "Today", props: {
      date: Date.current.iso8601,
      total_minutes: pending.sum { |i| i.activity.duration_minutes },
      pending_count: pending.length,
      progress: {
        mastered: mastered,
        total: total,
        domain: current_child.active_domains.first&.name || "Numeracy"
      },
      plan_items: items.map { |item| plan_item_props(item) }
    }
  end

  private

  def plan_item_props(item)
    {
      id: item.id,
      position: item.position,
      state: item.state,
      outcome: item.log_entries.last&.outcome,
      skill: {
        id: item.skill_id,
        code: item.skill.code,
        title: item.skill.title,
        strand: item.skill.strand,
        mastery_descriptor: item.skill.mastery_descriptor
      },
      activity: {
        title: item.activity.title,
        kind: item.activity.kind.humanize(capitalize: false),
        instructions: item.activity.instructions,
        materials: item.activity.materials,
        duration_minutes: item.activity.duration_minutes
      },
      has_worksheet: item.activity.resources.any?(&:generated_worksheet?)
    }
  end
end
