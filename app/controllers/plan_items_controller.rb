class PlanItemsController < ApplicationController
  before_action :require_child!

  # The escape hatch: replace a pending plan item's skill with one the
  # parent chose from the library.
  def swap
    item = current_child.plan_items.pending.find(params[:id])
    skill = Skill.find(params[:skill_id])
    activity = skill.activities.order(:position).last

    if activity.nil?
      return redirect_to skills_path, alert: "That skill has no activities yet."
    end

    ActiveRecord::Base.transaction do
      item.update!(skill: skill, activity: activity)
      progress = SkillProgress.find_or_create_by!(child: current_child, skill: skill)
      if progress.not_started?
        progress.update!(state: :introduced, introduced_at: Time.current)
      end
    end

    redirect_to today_path
  end
end
