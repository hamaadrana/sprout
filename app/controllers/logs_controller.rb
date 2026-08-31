class LogsController < ApplicationController
  before_action :require_child!

  def create
    plan_item = current_child.plan_items.find(params[:plan_item_id])
    SessionLogger.log(
      plan_item: plan_item,
      outcome: params.require(:outcome),
      minutes: params[:minutes],
      note: params[:note].presence
    )
    redirect_to root_path
  end
end
