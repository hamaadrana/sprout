class LogsController < ApplicationController
  before_action :require_child!

  # The log sheet: two taps is the whole thing, the rest is optional.
  def new
    item = current_child.plan_items.find(params[:plan_item_id])

    render inertia: "Log", props: {
      plan_item: {
        id: item.id,
        position: item.position,
        state: item.state,
        skill_title: item.skill.title,
        activity_title: item.activity.title,
        mastery_descriptor: item.skill.mastery_descriptor
      }
    }
  end

  def create
    plan_item = current_child.plan_items.find(params[:plan_item_id])

    entry = SessionLogger.log(
      plan_item: plan_item,
      outcome: params.require(:outcome),
      minutes: params[:minutes].presence,
      note: params[:note].presence
    )

    attach_photo(plan_item, entry) if params[:photo].present?

    redirect_to today_path
  rescue PortfolioPhoto::NotAnImage
    redirect_to today_path
  end

  private

  def attach_photo(plan_item, _entry)
    item = current_child.portfolio_items.create!(
      skill: plan_item.skill,
      caption: plan_item.activity.title,
      taken_on: Date.current
    )
    PortfolioPhoto.attach(item, params[:photo])
  end
end
