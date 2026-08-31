class WorksheetsController < ApplicationController
  before_action :require_child!
  layout "worksheet"

  def show
    @plan_item = current_child.plan_items.find(params[:plan_item_id])
    resource = @plan_item.activity.resources.generated_worksheet.first
    raise ActiveRecord::RecordNotFound, "No worksheet for this activity" if resource.nil?

    @variant = params.fetch(:variant, 0).to_i
    seed = WorksheetSeed.for(
      child: current_child, skill: @plan_item.skill,
      date: Date.current, variant: @variant
    )
    @worksheet = WorksheetBuilder.build(
      template: resource.worksheet_template,
      params: resource.worksheet_params,
      seed: seed
    )
    @child = current_child
    @skill = @plan_item.skill
  end
end
