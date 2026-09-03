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
      progress: { mastered: mastered, total: total },
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
        title: adapt(item.skill.title),
        strand: item.skill.strand,
        domain: item.skill.domain.name,
        mastery_descriptor: adapt(item.skill.mastery_descriptor)
      },
      activity: {
        title: adapt(item.activity.title),
        kind: item.activity.kind.humanize(capitalize: false),
        instructions: adapt(item.activity.instructions),
        materials: item.activity.materials,
        duration_minutes: item.activity.duration_minutes
      },
      worksheet_id: Worksheet.where(skill_code: item.skill.code)
                             .order(:level, :position).pick(:id)
    }
  end
end
