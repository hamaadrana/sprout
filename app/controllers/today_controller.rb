class TodayController < ApplicationController
  before_action :require_child!

  def show
    items = DailyPlan.for(current_child, date: Date.current)

    render inertia: "Today", props: {
      date: Date.current.iso8601,
      plan_items: items.map { |item| plan_item_props(item) },
      all_done: items.any? && items.all? { |i| !i.pending? },
      nothing_left: items.empty?
    }
  end

  private

  def plan_item_props(item)
    {
      id: item.id,
      state: item.state,
      skill: {
        code: item.skill.code,
        title: item.skill.title,
        mastery_descriptor: item.skill.mastery_descriptor,
        domain: item.skill.domain.name
      },
      activity: {
        title: item.activity.title,
        kind: item.activity.kind,
        instructions: item.activity.instructions,
        materials: item.activity.materials,
        duration_minutes: item.activity.duration_minutes
      },
      outcome: item.log_entries.last&.outcome
    }
  end
end
